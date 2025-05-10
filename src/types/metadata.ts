import { AIAnalysisResult } from './ai'

export type Metadata = {
  url: string
  title?: string
  description?: string
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
  readingTime?: number // Estimated reading time in minutes
} & Partial<AIAnalysisResult>

export interface ExtractionOptions {
  depth: 'basic' | 'normal' | 'deep'
  includeImages: boolean
  timeout?: number
}

export interface MetadataEnrichOptions {
  summaryLength: 'short' | 'medium' | 'long'
}
