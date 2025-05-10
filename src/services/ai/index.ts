import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { getConfig } from '@/config/manager'
import { Repository } from '@/types/github'
import { Metadata, MetadataEnrichOptions } from '@/types/metadata'
import { AIAnalysisResult } from '@/types/ai'
import chalk from 'chalk'

/**
 * Create AI provider
 * Create OpenAI client based on configuration
 */
export function createAIProvider(model: string = 'gpt-4o-mini') {
  const config = getConfig()

  if (!config.ai?.enabled) {
    throw new Error(
      'AI features are not enabled. Run `gh-explorer config set ai.enabled true` to enable.'
    )
  }

  if (!config.ai?.apiKey) {
    throw new Error(
      'AI API Key not configured. Run `gh-explorer config set ai.apiKey YOUR_API_KEY` to configure.'
    )
  }

  const options: Record<string, string> = {
    apiKey: config.ai.apiKey
  }

  if (config.ai.baseURL) {
    options.baseURL = config.ai.baseURL
  }

  return createOpenAI({
    apiKey: config.ai.apiKey,
    baseURL: config.ai.baseURL
  })(model)
}

/**
 * Generate text using AI
 * @param prompt The prompt text
 * @param systemPrompt System prompt
 * @param model Model name
 */
export async function generateAIText(
  prompt: string,
  systemPrompt: string = 'You are an expert technical analyst. Provide concise, objective, and accurate analysis following the requested format exactly.',
  model: string = 'gpt-4o-mini'
): Promise<string> {
  try {
    const aiModel = createAIProvider(model)

    const { text } = await generateText({
      model: aiModel,
      system: systemPrompt,
      prompt: prompt
    })

    return text
  } catch (error) {
    // Provide friendly error messages
    if ((error as Error).message.includes('API Key')) {
      console.error(
        '\n' + chalk.red('× AI API Configuration Error:') + ' ' + (error as Error).message
      )
      console.error(chalk.blue('Tip: Use these commands to configure and enable AI:'))
      console.error('  gh-explorer config set ai.apiKey YOUR_API_KEY')
      console.error('  gh-explorer config set ai.enabled true\n')
    } else if ((error as Error).message.includes('not enabled')) {
      console.error(
        '\n' + chalk.yellow('! AI Features Not Enabled:') + ' ' + (error as Error).message
      )
      console.error(chalk.blue('Tip: Use this command to enable AI:'))
      console.error('  gh-explorer config set ai.enabled true\n')
    } else {
      console.error(`AI generation failed: ${(error as Error).message}`)
    }

    throw error
  }
}

/**
 * Create metadata prompt with specified summary length
 * @param metadata Metadata
 * @param summaryLength Summary length
 * @returns Prompt string
 */
function createMetadataPromptWithLength(metadata: Metadata, summaryLength: string): string {
  const lengthDescription =
    summaryLength === 'short'
      ? 'within 50 words'
      : summaryLength === 'medium'
      ? 'within 100 words'
      : 'within 200 words'

  let prompt = `
  Please analyze the following webpage metadata and provide a concise analysis:
  
  URL: ${metadata.url}
  Title: ${metadata.title || 'No title'}
  Description: ${metadata.description || 'No description'}
  `

  if (metadata.author) {
    prompt += `Author: ${metadata.author}\n`
  }

  if (metadata.type) {
    prompt += `Type: ${metadata.type}\n`
  }

  if (metadata.contentPreview) {
    prompt += `Content preview: ${metadata.contentPreview.slice(0, 1000)}...\n`
  }

  prompt += `
  Please provide the following in JSON format:
  1. aiSummary: Content summary ${lengthDescription}
  2. keyPoints: 3-5 key points of the content (array)
  3. category: Array of content categories (1-5 items)
  `

  return prompt
}

/**
 * Create repository prompt with specified summary length
 * @param repo Repository object
 * @param summaryLength Summary length
 * @returns Prompt string
 */
function createRepoPromptWithLength(repo: Repository, summaryLength: string): string {
  const lengthDescription =
    summaryLength === 'short'
      ? 'within 50 words'
      : summaryLength === 'medium'
      ? 'within 100 words'
      : 'within 200 words'

  return `
  Please analyze the following GitHub repository information and provide a concise analysis:
  Repository: ${repo.author}/${repo.name}
  Description: ${repo.description || 'No description'}
  Language: ${repo.language || 'Unknown'}
  Stars: ${repo.stars}
  New stars this period: ${repo.starsInPeriod}
  
  Please provide the following in JSON format:
  1. aiSummary: Repository summary ${lengthDescription}
  2. keyPoints: Key points about this repository (array)
  3. category: Array of repository categories (1-5 items)
  `
}

/**
 * Parse AI response
 * @param text Response text from AI
 * @returns Parsed AI result
 */
function parseAIResponse(text: string): Partial<AIAnalysisResult> {
  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*?})/)

    let result
    if (jsonMatch && jsonMatch[1]) {
      result = JSON.parse(jsonMatch[1])
    } else {
      // Try to parse entire response
      result = JSON.parse(text.trim())
    }

    // 确保 category 是数组
    if (result.category && !Array.isArray(result.category)) {
      result.category = [result.category]
    }

    return result
  } catch (error) {
    console.error('Failed to parse AI response:', error)

    // Return basic structure on failure
    return {
      aiSummary: 'Could not parse AI response',
      keyPoints: [],
      category: []
    }
  }
}

/**
 * Enrich metadata using AI
 * @param metadata Original metadata
 * @param options AI enrichment options
 * @returns Enriched metadata
 */
export async function enrichMetadataWithAI(
  metadata: Metadata,
  options: MetadataEnrichOptions
): Promise<Metadata> {
  const config = getConfig()

  if (!config.ai.enabled) {
    return metadata
  }

  try {
    const prompt = createMetadataPromptWithLength(metadata, options.summaryLength)
    const aiText = await generateAIText(prompt)
    const enrichedData = parseAIResponse(aiText)

    return {
      ...metadata,
      ...enrichedData
    }
  } catch (error) {
    console.error(`AI enrichment failed: ${(error as Error).message}`)
    return metadata
  }
}

/**
 * Enrich repositories with AI
 * @param repositories Repository list
 * @param options AI enrichment options
 * @returns Enriched repository list
 */
export async function enrichWithAI(
  repositories: Repository[],
  options: MetadataEnrichOptions
): Promise<Repository[]> {
  const config = getConfig()

  if (!config.ai.enabled) {
    return repositories
  }

  const enrichPromises = repositories.map(async (repo) => {
    try {
      const prompt = createRepoPromptWithLength(repo, options.summaryLength)

      const aiText = await generateAIText(prompt)
      const enrichedData = parseAIResponse(aiText)

      return {
        ...repo,
        ...enrichedData
      }
    } catch (error) {
      console.error(
        `AI enrichment failed for repository ${repo.author}/${repo.name}: ${
          (error as Error).message
        }`
      )
      return repo
    }
  })

  return Promise.all(enrichPromises)
}
