import axios from 'axios'
import * as cheerio from 'cheerio'

import { Repository, TrendOptions } from '../../types/github'
import { cacheGet, cacheSet } from '../../utils/cache'

/**
 * Get GitHub trending repositories
 * @param options Trending options
 * @returns Promise<Repository[]> Trending repositories list
 */
export async function getTrendingRepos(options: TrendOptions): Promise<Repository[]> {
  const { language, since = 'daily' } = options

  const cacheKey = `trending:${language || 'all'}:${since}`

  const cachedData = cacheGet(cacheKey)

  if (cachedData) {
    return cachedData as Repository[]
  }

  let url = 'https://github.com/trending'
  if (language) {
    url += `/${encodeURIComponent(language)}`
  }
  url += `?since=${since}`

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'gh-explorer-cli'
      }
    })

    const repositories = parseGitHubTrendingHtml(response.data)

    cacheSet(cacheKey, repositories, 3600)

    return repositories
  } catch (error) {
    throw new Error(`获取趋势仓库失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Parse GitHub trending page HTML
 * @param html HTML Content
 * @returns Repository[] Repository list
 */
function parseGitHubTrendingHtml(html: string): Repository[] {
  const $ = cheerio.load(html)
  const repositories: Repository[] = []

  $('article.Box-row').each((index, element) => {
    const titleElement = $(element).find('h2.h3 a')
    const relativeUrl = titleElement.attr('href') || ''
    const [author, name] = relativeUrl.substring(1).split('/')

    const description = $(element).find('p').text().trim()

    const languageElement = $(element).find('[itemprop="programmingLanguage"]')
    const language = languageElement.text().trim()

    const languageColorElement = $(element).find('.repo-language-color')
    const languageColor = languageColorElement
      .attr('style')
      ?.replace('background-color:', '')
      .trim()

    const starsElement = $(element).find('a[href$="/stargazers"]')
    const stars = parseNumber(starsElement.text().trim())

    const forksElement = $(element).find('a[href$="/forks"]')
    const forks = parseNumber(forksElement.text().trim())

    const starsInPeriodElement = $(element).find('.d-inline-block.float-sm-right')
    const starsInPeriodText = starsInPeriodElement.text().trim()
    const starsInPeriod = parseNumber(
      starsInPeriodText.replace(/\s+stars\s+today|this\s+week|this\s+month/, '')
    )

    const avatarElement = $(element).find('img.avatar')
    const avatar = avatarElement.attr('src')

    repositories.push({
      name,
      author,
      rank: index + 1,
      url: `https://github.com${relativeUrl}`,
      description,
      language,
      languageColor,
      stars,
      forks,
      starsInPeriod,
      avatar
    })
  })

  return repositories
}

/**
 * Parse number string
 * @param text Number string
 * @returns Number
 */
function parseNumber(text: string): number {
  if (!text) return 0

  if (text.includes('k')) {
    return parseFloat(text.replace('k', '')) * 1000
  }

  return parseInt(text.replace(/,/g, ''), 10) || 0
}
