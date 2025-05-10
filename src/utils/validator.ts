import { TrendOptions } from '../types/github'

/**
 * Validate GitHub trending options
 * @param options Trending options
 */
export function validateTrendingOptions(options: TrendOptions): void {
  // Validate time period
  if (options.since && !['daily', 'weekly', 'monthly'].includes(options.since)) {
    throw new Error('Invalid time period, please use daily, weekly or monthly')
  }

  // Validate limit count
  if (options.limit && (isNaN(options.limit) || options.limit < 1 || options.limit > 100)) {
    throw new Error('Invalid limit, please use a number between 1-100')
  }
}

/**
 * Validate output format
 * @param format Output format
 */
export function validateOutputFormat(format: string): void {
  if (!['json', 'table', 'markdown'].includes(format)) {
    throw new Error('Invalid output format, please use json, table or markdown')
  }
}

/**
 * Validate URL
 * @param url URL string
 * @returns Whether it is a valid URL
 */
export function validateUrl(url: string): boolean {
  try {
    // Create URL object to validate URL
    const urlObj = new URL(url)

    // Ensure protocol is http or https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch (_error) {
    return false
  }
}
