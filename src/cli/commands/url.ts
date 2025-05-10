import chalk from 'chalk'
import { Command } from 'commander'
import ora from 'ora'

import { getConfig } from '@/config/manager'
import { formatMetadataOutput } from '@/formatters/formatter'
import { enrichMetadataWithAI } from '@/services/ai/enricher'
import { extractMetadata } from '@/services/metadata/extractor'
import { OutputFormat } from '@/types/output'
import { saveToFile } from '@/utils/file'
import { validateUrl } from '@/utils/validator'

interface UrlCommandOptions {
  format?: OutputFormat
  output?: string
  depth?: 'basic' | 'normal' | 'deep'
  ai?: boolean
}

/**
 * Register URL command
 * @param program Commander instance
 */
export function registerUrlCommand(program: Command): void {
  program
    .command('url <url>')
    .description('Analyze URL metadata')
    .option('-f, --format <format>', 'Output format (json, table, markdown)', 'json')
    .option('-o, --output <path>', 'Output to file')
    .option('-d, --depth <depth>', 'Analysis depth (basic, normal, deep)', 'normal')
    .option('--ai', 'Enable AI analysis', true)
    .option('--no-ai', 'Disable AI analysis')
    .action(async (url, options) => {
      await handleUrlCommand(url, options)
    })
}

/**
 * Handle URL command
 * @param url URL address
 * @param options Command options
 */
async function handleUrlCommand(url: string, options: UrlCommandOptions): Promise<void> {
  const spinner = ora('Processing...').start()

  try {
    // Get configuration and merge options
    const config = getConfig()

    // Parse depth with proper type checking
    let depth: 'basic' | 'normal' | 'deep' = 'normal'
    if (options.depth && ['basic', 'normal', 'deep'].includes(options.depth)) {
      depth = options.depth
    }

    // Parse output format
    let format: OutputFormat = config.output.defaultFormat
    if (options.format) {
      format = options.format as OutputFormat
    }

    const urlOptions = {
      enableAI: options.ai !== false,
      format,
      outputPath: options.output,
      depth
    }

    // URL validation
    spinner.text = 'Validating URL...'
    if (!validateUrl(url)) {
      spinner.fail(chalk.red('Invalid URL format'))
      process.exit(1)
    }

    // Content retrieval and metadata extraction
    spinner.text = 'Retrieving and analyzing content...'
    const metadata = await extractMetadata(url, {
      depth: urlOptions.depth,
      includeImages: urlOptions.depth !== 'basic',
      timeout: 30000
    })

    // AI enhancement (if enabled)
    let enrichedMetadata = metadata
    if (urlOptions.enableAI && config.ai.apiKey) {
      spinner.text = 'Performing AI analysis...'
      enrichedMetadata = await enrichMetadataWithAI(metadata, {
        model: config.ai.defaultModel,
        summaryLength: config.ai.summaryLength
      })
    }

    // Format output
    spinner.succeed('Analysis completed!')
    const formattedOutput = formatMetadataOutput(enrichedMetadata, {
      format: urlOptions.format,
      colorEnabled: config.output.colorEnabled,
      period: '', // Not needed but required by the formatter
      language: metadata.language
    })

    // Output results
    if (urlOptions.outputPath) {
      await saveToFile(formattedOutput, urlOptions.outputPath, urlOptions.format)
      console.log(chalk.green(`Results saved to: ${urlOptions.outputPath}`))
    } else {
      console.log(formattedOutput)
    }
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${(error as Error).message}`))
    process.exit(1)
  }
}
