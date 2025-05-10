import { getConfig } from '../../config/manager'
import { Repository } from '../../types/github'
import { Metadata, MetadataEnrichOptions } from '../../types/metadata'

/**
 * 使用AI增强元数据
 * @param metadata 原始元数据
 * @param options AI增强选项
 * @returns 增强后的元数据
 */
export async function enrichMetadataWithAI(
  metadata: Metadata,
  options: MetadataEnrichOptions
): Promise<Metadata> {
  const config = getConfig()

  // 如果没有 API 密钥或AI未启用，则直接返回原始数据
  if (!config.ai.apiKey || !config.ai.enabled) {
    return metadata
  }

  try {
    // 创建提示
    const _prompt = createMetadataPrompt(metadata, options.summaryLength)

    // 这里应该调用OpenAI API，但由于不确定是否有API密钥，我们暂时模拟一个响应
    // 实际项目中，请替换为真正的API调用
    const enrichedData = simulateAIResponse(metadata)

    // 返回增强后的元数据
    return {
      ...metadata,
      ...enrichedData
    }
  } catch (error) {
    // 如果 AI 增强失败，返回原始数据
    console.error(`AI 增强失败: ${(error as Error).message}`)
    return metadata
  }
}

/**
 * 使用AI增强仓库数据
 * @param repositories 仓库列表
 * @param options AI增强选项
 * @returns 增强后的仓库列表
 */
export async function enrichWithAI(
  repositories: Repository[],
  options: MetadataEnrichOptions
): Promise<Repository[]> {
  const config = getConfig()

  // 如果没有 API 密钥或AI未启用，则直接返回原始数据
  if (!config.ai.apiKey || !config.ai.enabled) {
    return repositories
  }

  // 并行处理每个仓库
  const enrichPromises = repositories.map(async (repo) => {
    try {
      // 创建提示
      const _prompt = createRepoPrompt(repo, options.summaryLength)

      // 这里应该调用OpenAI API，但由于不确定是否有API密钥，我们暂时模拟一个响应
      // 实际项目中，请替换为真正的API调用
      const enrichedData = simulateRepoAIResponse(repo)

      // 返回增强后的仓库数据
      return {
        ...repo,
        ...enrichedData
      }
    } catch (error) {
      // 如果 AI 增强失败，返回原始数据
      console.error(
        `对仓库 ${repo.author}/${repo.name} 的 AI 增强失败: ${(error as Error).message}`
      )
      return repo
    }
  })

  // 等待所有 Promise 完成
  return Promise.all(enrichPromises)
}

/**
 * 创建元数据AI提示
 * @param metadata 元数据
 * @param summaryLength 摘要长度
 * @returns 提示字符串
 */
function createMetadataPrompt(metadata: Metadata, summaryLength: string): string {
  const lengthDescription =
    summaryLength === 'short' ? '50字以内' : summaryLength === 'medium' ? '100字以内' : '200字以内'

  let prompt = `
  请分析以下网页元数据，并提供简洁分析：
  
  URL: ${metadata.url}
  标题: ${metadata.title || '无标题'}
  描述: ${metadata.description || '无描述'}
  `

  if (metadata.author) {
    prompt += `作者: ${metadata.author}\n`
  }

  if (metadata.type) {
    prompt += `类型: ${metadata.type}\n`
  }

  if (metadata.contentPreview) {
    prompt += `内容预览: ${metadata.contentPreview.slice(0, 1000)}...\n`
  }

  prompt += `
  请提供以下内容（JSON 格式）：
  1. aiSummary: ${lengthDescription}的内容简介
  2. keyPoints: 该内容的 3-5 个关键点（数组）
  3. category: 最适合的内容分类（如"技术文档"、"新闻报道"、"教程指南"等）
  4. readingTime: 估计阅读时间（分钟数）
  `

  return prompt
}

/**
 * 创建仓库AI提示
 * @param repo 仓库对象
 * @param summaryLength 摘要长度
 * @returns 提示字符串
 */
function createRepoPrompt(repo: Repository, summaryLength: string): string {
  const lengthDescription =
    summaryLength === 'short' ? '50字以内' : summaryLength === 'medium' ? '100字以内' : '200字以内'

  return `
  请分析以下 GitHub 仓库信息，并提供简洁分析：
  仓库名称: ${repo.author}/${repo.name}
  描述: ${repo.description || '无描述'}
  语言: ${repo.language || '未知'}
  星标数: ${repo.stars}
  本期新增星标: ${repo.starsInPeriod}
  
  请提供以下内容（JSON 格式）：
  1. aiSummary: ${lengthDescription}的仓库简介
  2. keyFeatures: 该项目的 3 个主要特点（数组）
  3. useCases: 2-3 个潜在使用场景（数组）
  `
}

/**
 * 模拟元数据AI响应（实际项目请替换为真正的API调用）
 * @param metadata 元数据
 * @returns 模拟的AI响应
 */
function simulateAIResponse(metadata: Metadata): Partial<Metadata> {
  // 从标题和描述生成简单的分析
  const title = metadata.title || ''
  const description = metadata.description || ''

  // 生成摘要
  let aiSummary = '这是一个网页内容的自动生成摘要。'
  if (title.length > 10) {
    aiSummary = `${title}. ${description.slice(0, 100)}`
  }

  // 生成关键点
  const keyPoints = ['这是自动生成的关键点1', '这是自动生成的关键点2', '这是自动生成的关键点3']

  // 估算阅读时间 (简单估算：每250字1分钟)
  const content = metadata.contentPreview || ''
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 250))

  // 确定分类
  let category = '网页'
  if (
    title.toLowerCase().includes('github') ||
    description.toLowerCase().includes('github') ||
    metadata.url.includes('github.com')
  ) {
    category = '技术文档'
  } else if (title.toLowerCase().includes('news') || description.toLowerCase().includes('news')) {
    category = '新闻报道'
  }

  return {
    aiSummary,
    keyPoints,
    category,
    readingTime
  }
}

/**
 * 模拟仓库AI响应（实际项目请替换为真正的API调用）
 * @param repo 仓库对象
 * @returns 模拟的AI响应
 */
function simulateRepoAIResponse(repo: Repository): Partial<Repository> {
  const name = repo.name || ''
  const description = repo.description || ''

  // 生成摘要
  let aiSummary = `${name} 是一个 ${repo.language || '多语言'} 项目`
  if (description) {
    aiSummary += `，它${description.slice(0, 100)}`
  }

  // 生成特点
  const keyFeatures = [
    `使用 ${repo.language || '多种语言'} 实现`,
    `拥有 ${repo.stars} 个星标，表明相当受欢迎`,
    `活跃开发中，最近获得 ${repo.starsInPeriod} 个新星标`
  ]

  // 生成使用场景
  const useCases = ['可用于开发和测试项目', '适合学习和研究', '可以作为类似项目的参考']

  return {
    aiSummary,
    keyFeatures,
    useCases
  }
}
