/**
 * Core AI analysis result interface
 */
export interface AIAnalysisResult {
  /**
   * AI-generated summary of the content
   */
  aiSummary: string

  /**
   * Key points or highlights extracted from the content
   */
  keyPoints: string[]

  /**
   * Content category classification
   */
  category: string[]
}
