import axios from 'axios';
import * as cheerio from 'cheerio';

import { Repository, TrendOptions } from '../../types/github';
import { cacheGet, cacheSet } from '../../utils/cache';

/**
 * 获取GitHub趋势仓库
 * @param options 趋势选项
 * @returns Promise<Repository[]> 趋势仓库列表
 */
export async function getTrendingRepos(options: TrendOptions): Promise<Repository[]> {
  const { language, since = 'daily' } = options;

  // 构建缓存键
  const cacheKey = `trending:${language || 'all'}:${since}`;

  // 检查缓存
  const cachedData = cacheGet(cacheKey);
  if (cachedData) {
    return cachedData as Repository[];
  }

  // 构建URL
  let url = 'https://github.com/trending';
  if (language) {
    url += `/${encodeURIComponent(language)}`;
  }
  url += `?since=${since}`;

  try {
    // 发送请求
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'gittrend-cli',
      },
    });

    // 解析HTML
    const repositories = parseGitHubTrendingHtml(response.data);

    // 缓存结果
    cacheSet(cacheKey, repositories, 3600); // 缓存一小时

    return repositories;
  } catch (error) {
    throw new Error(`获取趋势仓库失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 解析GitHub趋势页面HTML
 * @param html HTML内容
 * @returns Repository[] 仓库列表
 */
function parseGitHubTrendingHtml(html: string): Repository[] {
  const $ = cheerio.load(html);
  const repositories: Repository[] = [];

  // 提取仓库信息
  $('article.Box-row').each((index, element) => {
    // 解析仓库名称和作者
    const titleElement = $(element).find('h2.h3 a');
    const relativeUrl = titleElement.attr('href') || '';
    const [author, name] = relativeUrl.substring(1).split('/');

    // 解析描述
    const description = $(element).find('p').text().trim();

    // 解析语言
    const languageElement = $(element).find('[itemprop="programmingLanguage"]');
    const language = languageElement.text().trim();

    // 解析语言颜色
    const languageColorElement = $(element).find('.repo-language-color');
    const languageColor = languageColorElement.attr('style')?.replace('background-color:', '').trim();

    const starsElement = $(element).find('a[href$="/stargazers"]');
    const stars = parseNumber(starsElement.text().trim());

    // 解析fork数
    const forksElement = $(element).find('a[href$="/forks"]');
    const forks = parseNumber(forksElement.text().trim());

    // 解析本周期新增星标
    const starsInPeriodElement = $(element).find('.d-inline-block.float-sm-right');
    const starsInPeriodText = starsInPeriodElement.text().trim();
    const starsInPeriod = parseNumber(starsInPeriodText.replace(/\s+stars\s+today|this\s+week|this\s+month/, ''));

    // 解析头像
    const avatarElement = $(element).find('img.avatar');
    const avatar = avatarElement.attr('src');

    // 构建仓库对象
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
      avatar,
    });
  });

  return repositories;
}

/**
 * 解析数字字符串
 * @param text 数字字符串
 * @returns 数字
 */
function parseNumber(text: string): number {
  // 处理空字符串
  if (!text) return 0;

  // 处理'1.2k'这样的格式
  if (text.includes('k')) {
    return parseFloat(text.replace('k', '')) * 1000;
  }

  // 处理普通数字
  return parseInt(text.replace(/,/g, ''), 10) || 0;
}
