/**
 * GhExplorer - GitHub trending analysis tool
 */

// Import services and types
import { formatOutput } from './formatters/formatter'
import { enrichMetadataWithAI, enrichWithAI } from './services/ai'
import { extractMetadata } from './services/metadata/extractor'
import { getTrendingRepos } from './services/github/scraper'
import { Repository, TrendOptions } from './types/github'
import { OutputFormat } from './types/index'
import { Metadata, ExtractionOptions, MetadataEnrichOptions } from './types/metadata'

// Export types and services
export { Metadata, ExtractionOptions, MetadataEnrichOptions } from './types/metadata'
export { TrendOptions, OutputFormat } from './types/index'
export { Repository } from './types/github'
export { enrichMetadataWithAI, enrichWithAI } from './services/ai'
export { extractMetadata } from './services/metadata/extractor'
export { formatOutput, formatMetadataOutput } from './formatters/formatter'
export { getTrendingRepos } from './services/github/scraper'

/**
 * Get GitHub trending repositories data
 * @param options Trend options
 * @returns Promise<Repository[]> Trending repositories data
 */
export async function ghExplorer(options: TrendOptions = {}): Promise<Repository[]> {
  return getTrendingRepos(options)
}

/**
 * Get and format GitHub trending repositories data
 * @param options Trend options
 * @param format Output format
 * @returns Promise<string> Formatted trending data
 */
export async function ghExplorerFormatted(
  options: TrendOptions = {},
  format: OutputFormat = 'json'
): Promise<string> {
  const repositories = await getTrendingRepos(options)

  return formatOutput(repositories, {
    format,
    colorEnabled: true,
    period: options.since || 'daily',
    language: options.language
  })
}

/**
 * Analyze URL metadata
 * @param url URL address
 * @param options Extraction options
 * @returns Promise<Metadata> Metadata object
 */
export async function urlMetadata(
  url: string,
  options: Partial<ExtractionOptions> = {}
): Promise<Metadata> {
  const extractionOptions: ExtractionOptions = {
    depth: options.depth || 'normal',
    includeImages: options.includeImages !== undefined ? options.includeImages : true,
    timeout: options.timeout || 30000
  }

  return extractMetadata(url, extractionOptions)
}

/**
 * Analyze URL metadata and use AI to enhance
 * @param url URL address
 * @param extractOptions Extraction options
 * @param enrichOptions AI enrichment options
 * @returns Promise<Metadata> Enriched metadata object
 */
export async function urlMetadataEnriched(
  url: string,
  extractOptions: Partial<ExtractionOptions> = {},
  enrichOptions: Partial<MetadataEnrichOptions> = {}
): Promise<Metadata> {
  const metadata = await urlMetadata(url, extractOptions)

  const metadataEnrichOptions: MetadataEnrichOptions = {
    summaryLength: enrichOptions.summaryLength || 'medium'
  }

  return enrichMetadataWithAI(metadata, metadataEnrichOptions)
}

/**
 * Get GitHub trending repositories with AI enhancement
 * @param options Trend options
 * @param enrichOptions AI enrichment options
 * @returns Promise<Repository[]> Enhanced trending repositories data
 */
export async function ghExplorerEnriched(
  options: TrendOptions = {},
  enrichOptions: Partial<MetadataEnrichOptions> = {}
): Promise<Repository[]> {
  const repositories = await getTrendingRepos(options)

  const aiOptions: MetadataEnrichOptions = {
    summaryLength: enrichOptions.summaryLength || 'medium'
  }

  return enrichWithAI(repositories, aiOptions)
}
