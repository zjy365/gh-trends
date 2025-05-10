import chalk from 'chalk'
import { Command, Option } from 'commander'
import ora from 'ora'

import { getConfig } from '@/config/manager'
import { formatOutput } from '@/formatters/formatter'
import { filterRepositories } from '@/services/github/filter'
import { getTrendingRepos } from '@/services/github/scraper'
import { enrichWithAI } from '@/services/ai'
import { TrendOptions } from '@/types/github'
import { OutputFormat } from '@/types/output'
import { MetadataEnrichOptions } from '@/types/metadata'
import { saveToFile } from '@/utils/file'
import { validateTrendingOptions, validateOutputFormat } from '@/utils/validator'

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
    .addOption(
      new Option('-s, --since <period>', 'Time period')
        .choices(['daily', 'weekly', 'monthly'])
        .default('daily')
    )
    .option('-n, --limit <number>', 'Limit the number of results', '25')
    .option('-t, --topics <topics>', 'Filter by topics (comma-separated)')
    .addOption(
      new Option('-f, --format <format>', 'Output format')
        .choices(['json', 'table', 'markdown'])
        .default('json')
    )
    .option('-o, --output <path>', 'Output to file')
    .option('--ai', 'Enable AI analysis', true)
    .option('--no-ai', 'Disable AI analysis')
    .option('--ai-summary <length>', 'AI summary length (short, medium, long)', 'medium')
    .action(async (options) => {
      await handleTrendingCommand(options)
    })
}

/**
 * Handle trending command
 * @param options Command options
 */
async function handleTrendingCommand(options: any): Promise<void> {
  try {
    const config = getConfig()

    let since: 'daily' | 'weekly' | 'monthly' = 'daily'
    if (options.since && ['daily', 'weekly', 'monthly'].includes(options.since)) {
      since = options.since as 'daily' | 'weekly' | 'monthly'
    }

    const limit = parseInt(options.limit, 10) || config.github.defaultLimit

    const topics = options.topics ? options.topics.split(',').map((t: string) => t.trim()) : []

    let format: OutputFormat = config.output.defaultFormat
    if (options.format) {
      validateOutputFormat(options.format)
      format = options.format as OutputFormat
    }

    let summaryLength: 'short' | 'medium' | 'long' = config.ai?.summaryLength || 'medium'
    if (options.aiSummary && ['short', 'medium', 'long'].includes(options.aiSummary)) {
      summaryLength = options.aiSummary
    }

    const enableAI = options.ai !== false && config.ai?.enabled

    const trendingOptions: TrendOptions = {
      language: options.language,
      since,
      limit
    }

    validateTrendingOptions(trendingOptions)

    const spinner = ora('Getting GitHub trending repositories...').start()

    try {
      let repositories = await getTrendingRepos(trendingOptions)

      // Filter repositories
      repositories = filterRepositories(repositories, {
        limit,
        topics
      })

      // Enrich with AI if requested
      if (enableAI && config.ai?.apiKey) {
        spinner.text = 'Enriching repositories with AI analysis...'

        const aiOptions: MetadataEnrichOptions = {
          summaryLength
        }

        repositories = await enrichWithAI(repositories, aiOptions)
      }

      spinner.succeed(`Successfully got ${repositories.length} trending repositories`)

      // Format output
      const formattedOutput = formatOutput(repositories, {
        format,
        colorEnabled: config.output.colorEnabled,
        period: since,
        language: options.language
      })

      // Output results
      if (options.output) {
        await saveToFile(formattedOutput, options.output, format)
        console.log(chalk.green(`Results saved to: ${options.output}`))
      } else {
        console.log(formattedOutput)
      }
    } catch (error) {
      spinner.fail(
        chalk.red(
          `Failed to get trending data: ${error instanceof Error ? error.message : String(error)}`
        )
      )
      process.exit(1)
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`))
    process.exit(1)
  }
}
