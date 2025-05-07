import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

import { getConfig } from '@/config/manager';
import { formatOutput } from '@/formatters/formatter';
import { filterRepositories } from '@/services/github/filter';
import { getTrendingRepos } from '@/services/github/scraper';
import { TrendOptions } from '@/types/github';
import { OutputFormat } from '@/types/output';
import { saveToFile } from '@/utils/file';
import { validateTrendingOptions, validateOutputFormat } from '@/utils/validator';

/**
 * Register trending command
 * @param program Commander instance
 */
export function registerTrendingCommand(program: Command): void {
  program
    .command('trending')
    .alias('t')
    .description('Get GitHub trending repositories')
    .option('-l, --language <language>', 'Filter by programming language')
    .option('-s, --since <period>', 'Time period (daily, weekly, monthly)', 'daily')
    .option('-n, --limit <number>', 'Limit the number of results', '25')
    .option('-t, --topics <topics>', 'Filter by topics (comma-separated)')
    .option('-f, --format <format>', 'Output format (json, table, markdown)', 'table')
    .option('-o, --output <path>', 'Output to file')
    .action(async (options) => {
      await handleTrendingCommand(options);
    });
}

/**
 * Handle trending command
 * @param options Command options
 */
async function handleTrendingCommand(options: any): Promise<void> {
  try {
    const config = getConfig();

    let since: 'daily' | 'weekly' | 'monthly' = 'daily';
    if (options.since && ['daily', 'weekly', 'monthly'].includes(options.since)) {
      since = options.since as 'daily' | 'weekly' | 'monthly';
    }

    const limit = parseInt(options.limit, 10) || config.github.defaultLimit;

    const topics = options.topics ? options.topics.split(',').map((t: string) => t.trim()) : [];

    let format: OutputFormat = config.output.defaultFormat;
    if (options.format) {
      validateOutputFormat(options.format);
      format = options.format as OutputFormat;
    }

    const trendingOptions: TrendOptions = {
      language: options.language,
      since,
      limit,
    };

    validateTrendingOptions(trendingOptions);

    const spinner = ora('Getting GitHub trending repositories...').start();

    try {
      const repositories = await getTrendingRepos(trendingOptions);

      // Filter repositories
      const filteredRepos = filterRepositories(repositories, {
        limit,
        topics,
      });

      spinner.succeed(`Successfully got ${filteredRepos.length} trending repositories`);

      // Format output
      const formattedOutput = formatOutput(filteredRepos, {
        format,
        colorEnabled: config.output.colorEnabled,
        period: since,
        language: options.language,
      });

      // Output results
      if (options.output) {
        await saveToFile(formattedOutput, options.output, format);
        console.log(chalk.green(`Results saved to: ${options.output}`));
      } else {
        console.log(formattedOutput);
      }
    } catch (error) {
      spinner.fail(chalk.red(`Failed to get trending data: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}
