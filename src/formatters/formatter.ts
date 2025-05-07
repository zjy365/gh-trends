import chalk from 'chalk';
import { table } from 'table';

import { Repository } from '../types/github';
import { Metadata } from '../types/metadata';
import { FormatOptions } from '../types/output';

/**
 * formatter output
 * @param repositories repositories
 * @param options options
 * @returns formatted string
 */
export function formatOutput(repositories: Repository[], options: FormatOptions): string {
  switch (options.format) {
    case 'json':
      return formatJson(repositories);
    case 'markdown':
      return formatMarkdown(repositories, options);
    case 'table':
    default:
      return formatTable(repositories, options);
  }
}

/**
 * format metadata output
 * @param metadata metadata
 * @param options options
 * @returns formatted string
 */
export function formatMetadataOutput(metadata: Metadata, options: FormatOptions): string {
  switch (options.format) {
    case 'json':
      return formatMetadataJson(metadata);
    case 'markdown':
      return formatMetadataMarkdown(metadata);
    case 'table':
    default:
      return formatMetadataTable(metadata, options);
  }
}

/**
 * format to JSON
 * @param repositories repositories
 * @returns JSON string
 */
function formatJson(repositories: Repository[]): string {
  return JSON.stringify(repositories, null, 2);
}

/**
 * format metadata to JSON
 * @param metadata metadata
 * @returns JSON string
 */
function formatMetadataJson(metadata: Metadata): string {
  const outputMetadata = { ...metadata };
  delete outputMetadata.contentPreview;

  return JSON.stringify(outputMetadata, null, 2);
}

/**
 * Format the output as a table
 * @param repositories
 * @param options
 * @returns
 */
function formatTable(repositories: Repository[], options: FormatOptions): string {
  const { colorEnabled, period, language } = options;

  const header = [
    colorEnabled ? chalk.bold('#') : '#',
    colorEnabled ? chalk.bold('Repository') : 'Repository',
    colorEnabled ? chalk.bold('Description') : 'Description',
    colorEnabled ? chalk.bold('Language') : 'Language',
    colorEnabled ? chalk.bold('Stars') : 'Stars',
    colorEnabled ? chalk.bold('New Stars') : 'New Stars',
    colorEnabled ? chalk.bold('Forks') : 'Forks',
  ];

  // Prepare data rows
  const rows = repositories.map((repo) => {
    const repoName = colorEnabled
      ? chalk.blue(`${repo.author || ''}/${repo.name}`)
      : `${repo.author || ''}/${repo.name}`;

    const description = repo.description ? truncate(repo.description, 60) : '';

    const stars = formatNumber(repo.stars);
    const starsInPeriod = colorEnabled
      ? chalk.green(`+${formatNumber(repo.starsInPeriod || 0)}`)
      : `+${formatNumber(repo.starsInPeriod || 0)}`;

    return [
      repo.rank.toString(),
      repoName,
      description,
      repo.language || '-',
      stars,
      starsInPeriod,
      formatNumber(repo.forks),
    ];
  });

  // generate table
  const data = [header, ...rows];
  const config = {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼',
    },
    columns: {
      0: { width: 6 },
      1: { width: 30 },
      2: { width: 60 },
      3: { width: 15 },
      4: { width: 10 },
      5: { width: 10 },
      6: { width: 10 },
    },
  };

  const title = colorEnabled
    ? chalk.yellow(`🔥 GitHub Trending Repositories${language ? ` (${language})` : ''} - ${getPeriodText(period)}`)
    : `GitHub Trending Repositories${language ? ` (${language})` : ''} - ${getPeriodText(period)}`;

  return `\n${title}\n\n${table(data, config)}\n`;
}

/**
 * format metadata to table
 * @param metadata metadata
 * @param options options
 * @returns table string
 */
function formatMetadataTable(metadata: Metadata, options: FormatOptions): string {
  const { colorEnabled } = options;

  // prepare table data
  const rows: string[][] = [];

  // add basic information
  rows.push([colorEnabled ? chalk.bold('URL') : 'URL', metadata.url]);

  rows.push([colorEnabled ? chalk.bold('Title') : 'Title', metadata.title || 'No Title']);

  rows.push([
    colorEnabled ? chalk.bold('Description') : 'Description',
    truncate(metadata.description || 'No Description', 100),
  ]);

  // add other valid information
  if (metadata.author) {
    rows.push([colorEnabled ? chalk.bold('Author') : 'Author', metadata.author]);
  }

  if (metadata.publisher) {
    rows.push([colorEnabled ? chalk.bold('Publisher') : 'Publisher', metadata.publisher]);
  }

  if (metadata.language) {
    rows.push([colorEnabled ? chalk.bold('Language') : 'Language', metadata.language]);
  }

  if (metadata.type) {
    rows.push([colorEnabled ? chalk.bold('Type') : 'Type', metadata.type]);
  }

  if (metadata.published) {
    rows.push([colorEnabled ? chalk.bold('Published') : 'Published', metadata.published.toISOString().split('T')[0]]);
  }

  if (metadata.modified) {
    rows.push([colorEnabled ? chalk.bold('Modified') : 'Modified', metadata.modified.toISOString().split('T')[0]]);
  }

  if (metadata.keywords && metadata.keywords.length) {
    rows.push([colorEnabled ? chalk.bold('Keywords') : 'Keywords', metadata.keywords.join(', ')]);
  }

  if (metadata.tags && metadata.tags.length) {
    rows.push([colorEnabled ? chalk.bold('Tags') : 'Tags', metadata.tags.join(', ')]);
  }

  // Add AI enhanced information
  if (metadata.aiSummary) {
    rows.push([colorEnabled ? chalk.bold('AI Summary') : 'AI Summary', metadata.aiSummary]);
  }

  if (metadata.category) {
    rows.push([colorEnabled ? chalk.bold('Category') : 'Category', metadata.category]);
  }

  if (metadata.readingTime) {
    rows.push([colorEnabled ? chalk.bold('Reading Time') : 'Reading Time', ` ${metadata.readingTime} minutes`]);
  }

  if (metadata.keyPoints && metadata.keyPoints.length) {
    const keyPointsText = metadata.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n');

    rows.push([colorEnabled ? chalk.bold('Key Points') : 'Key Points', keyPointsText]);
  }

  // generate table
  const title = colorEnabled ? chalk.yellow('📄 URL Metadata Analysis') : 'URL Metadata Analysis';

  return `\n${title}\n\n${table(rows)}\n`;
}

/**
 * format to markdown
 * @param repositories repositories
 * @param options options
 * @returns markdown string
 */
function formatMarkdown(repositories: Repository[], options: FormatOptions): string {
  const { period, language } = options;

  // title
  let md = `# 🔥 GitHub Trending Repositories${language ? ` (${language})` : ''} - ${getPeriodText(period)}\n\n`;

  repositories.forEach((repo) => {
    md += `## ${repo.rank}. [${repo.author || ''}/${repo.name}](${repo.url})\n\n`;

    if (repo.description) {
      md += `${repo.description}\n\n`;
    }

    md += `- **Language:** ${repo.language || 'Not Specified'}\n`;
    md += `- **⭐ Stars:** ${formatNumber(repo.stars)} (New: +${formatNumber(repo.starsInPeriod || 0)})\n`;
    md += `- **🍴 Forks:** ${formatNumber(repo.forks)}\n`;

    // Add AI enhanced content (if available)
    if (repo.aiSummary) {
      md += `\n### AI Analysis Summary\n\n${repo.aiSummary}\n`;
    }

    if (repo.keyFeatures && repo.keyFeatures.length > 0) {
      md += '\n### Key Features\n\n';
      repo.keyFeatures.forEach((feature) => {
        md += `- ${feature}\n`;
      });
    }

    if (repo.useCases && repo.useCases.length > 0) {
      md += '\n### Use Cases\n\n';
      repo.useCases.forEach((useCase) => {
        md += `- ${useCase}\n`;
      });
    }

    md += '\n---\n\n';
  });

  return md;
}

/**
 * Format metadata to Markdown
 * @param metadata metadata object
 * @returns Markdown string
 */
function formatMetadataMarkdown(metadata: Metadata): string {
  // Title
  let md = '# URL Metadata Analysis\n\n';

  // Basic information
  md += '## Basic Information\n\n';
  md += `- **URL:** ${metadata.url}\n`;
  md += `- **Title:** ${metadata.title || 'No Title'}\n`;
  md += `- **Description:** ${metadata.description || 'No Description'}\n`;

  if (metadata.author) {
    md += `- **Author:** ${metadata.author}\n`;
  }

  if (metadata.publisher) {
    md += `- **Publisher:** ${metadata.publisher}\n`;
  }

  if (metadata.language) {
    md += `- **Language:** ${metadata.language}\n`;
  }

  if (metadata.type) {
    md += `- **Type:** ${metadata.type}\n`;
  }

  if (metadata.published) {
    md += `- **Published Date:** ${metadata.published.toISOString().split('T')[0]}\n`;
  }

  if (metadata.modified) {
    md += `- **Modified Date:** ${metadata.modified.toISOString().split('T')[0]}\n`;
  }

  // Keywords and tags
  if (metadata.keywords && metadata.keywords.length) {
    md += '\n## Keywords\n\n';
    md += metadata.keywords.join(', ') + '\n';
  }

  if (metadata.tags && metadata.tags.length) {
    md += '\n## Tags\n\n';
    md += metadata.tags.join(', ') + '\n';
  }

  // AI enhanced information
  if (metadata.aiSummary || (metadata.keyPoints && metadata.keyPoints.length)) {
    md += '\n## AI Analysis\n\n';

    if (metadata.aiSummary) {
      md += `### Summary\n\n${metadata.aiSummary}\n\n`;
    }

    if (metadata.category) {
      md += `**Category:** ${metadata.category}\n\n`;
    }

    if (metadata.readingTime) {
      md += `**Estimated Reading Time:** About ${metadata.readingTime} minutes\n\n`;
    }

    if (metadata.keyPoints && metadata.keyPoints.length) {
      md += '### Key Points\n\n';
      metadata.keyPoints.forEach((point, index) => {
        md += `${index + 1}. ${point}\n`;
      });
    }
  }

  // Available images
  if (metadata.image || metadata.icon) {
    md += '\n## Images\n\n';

    if (metadata.image) {
      md += `- **Main Image:** ${metadata.image}\n`;
    }

    if (metadata.icon) {
      md += `- **Icon:** ${metadata.icon}\n`;
    }
  }

  return md;
}

/**
 * Get period text
 * @param period period
 * @returns period text
 */
function getPeriodText(period: string): string {
  switch (period) {
    case 'daily':
      return 'Today';
    case 'weekly':
      return 'This Week';
    case 'monthly':
      return 'This Month';
    default:
      return period;
  }
}

/**
 * Format number
 * @param num number
 * @returns formatted string
 */
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Truncate text
 * @param text text
 * @param maxLength maximum length
 * @returns truncated text
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
