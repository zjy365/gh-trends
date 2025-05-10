import axios from 'axios'
import * as cheerio from 'cheerio'

import { Metadata, ExtractionOptions } from '../../types/metadata'

/**
 * Extract metadata from URL
 * @param url URL address
 * @param options Extraction options
 * @returns Promise<Metadata> Metadata object
 */
export async function extractMetadata(url: string, options: ExtractionOptions): Promise<Metadata> {
  try {
    // Get page content
    const pageContent = await getPageContent(url, options.timeout)

    // Parse metadata
    const metadata = parseMetadata(url, pageContent, options)

    return metadata
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${(error as Error).message}`)
  }
}

/**
 * Get page content
 * @param url URL address
 * @param timeout Timeout in milliseconds
 * @returns Promise<string> Page HTML content
 */
export async function getPageContent(url: string, timeout = 30000): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'gh-explorer-cli/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml'
      },
      timeout
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to get content: HTTP status code ${error.response.status}`)
    }
    throw new Error(`Failed to get content: ${(error as Error).message}`)
  }
}

/**
 * Parse HTML to extract metadata
 * @param url Original URL
 * @param html HTML content
 * @param options Extraction options
 * @returns Metadata object
 */
function parseMetadata(url: string, html: string, options: ExtractionOptions): Metadata {
  // Create initial metadata object
  const metadata: Metadata = {
    url,
    title: '',
    description: ''
  }

  // Load HTML
  const $ = cheerio.load(html)

  // Extract basic metadata
  metadata.title = $('title').text().trim() || ''
  metadata.description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    ''

  // Extract other basic metadata
  metadata.author =
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content') ||
    undefined

  metadata.publisher = $('meta[property="og:site_name"]').attr('content') || undefined

  metadata.type = $('meta[property="og:type"]').attr('content') || undefined

  // Extract images (if needed)
  if (options.includeImages) {
    metadata.image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      undefined

    // Extract website icon
    const iconLink =
      $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')

    if (iconLink) {
      // Handle relative URLs
      metadata.icon = iconLink.startsWith('http') ? iconLink : new URL(iconLink, url).toString()
    }
  }

  // Extract keywords and tags
  const keywords = $('meta[name="keywords"]').attr('content')
  if (keywords) {
    metadata.keywords = keywords.split(',').map((k) => k.trim())
  }

  // Extract language
  metadata.language = $('html').attr('lang') || undefined

  // Extract date information
  const publishedTime = $('meta[property="article:published_time"]').attr('content')
  if (publishedTime) {
    metadata.published = new Date(publishedTime)
  }

  const modifiedTime = $('meta[property="article:modified_time"]').attr('content')
  if (modifiedTime) {
    metadata.modified = new Date(modifiedTime)
  }

  // Deep analysis (when depth is 'deep')
  if (options.depth === 'deep') {
    // Extract more content and structure information...
    extractDeepMetadata($, metadata)
  }

  return metadata
}

/**
 * Perform deep metadata extraction
 * @param $ Cheerio instance
 * @param metadata Metadata object
 */
function extractDeepMetadata($: cheerio.CheerioAPI, metadata: Metadata): void {
  // Extract main content text (for AI analysis)
  const contentText: string[] = []

  // Try to find the main content area
  const mainContent = $('article, main, .content, #content, .article')

  if (mainContent.length > 0) {
    // Has explicit content area
    mainContent.find('p, h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim()
      if (text) contentText.push(text)
    })
  } else {
    // No explicit content area, try to get all paragraphs on the page
    $('p').each((_, element) => {
      const text = $(element).text().trim()
      if (text && text.length > 40) contentText.push(text) // Only get meaningful paragraphs
    })
  }

  // Limit content length to avoid excessive length
  metadata.contentPreview = contentText.join(' ').slice(0, 5000)

  // Try to extract tags or categories
  const tags: string[] = []
  $('a[rel="tag"], .tags a, .categories a, .topics a').each((_, element) => {
    const tag = $(element).text().trim()
    if (tag) tags.push(tag)
  })

  if (tags.length > 0) {
    metadata.tags = tags
  }
}
