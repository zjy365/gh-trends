export interface Metadata {
  url: string
  title: string
  description: string
  image?: string
  icon?: string
  author?: string
  publisher?: string
  type?: string
  language?: string
  tags?: string[]
  keywords?: string[]
  published?: Date
  modified?: Date
  contentPreview?: string // Content fragment for AI analysis
  // AI enhanced fields
  aiSummary?: string
  keyPoints?: string[]
  category?: string
  readingTime?: number
}

export interface ExtractionOptions {
  depth: 'basic' | 'normal' | 'deep'
  includeImages: boolean
  timeout?: number
}

export interface MetadataEnrichOptions {
  model: string
  summaryLength: 'short' | 'medium' | 'long'
}
