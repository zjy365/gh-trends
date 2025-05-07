import axios from 'axios';
import * as cheerio from 'cheerio';

import { TrendOptions, Repository } from '../types';

export class TrendService {
  private baseUrl = 'https://github.com/trending';

  /**
   * 抓取GitHub趋势仓库
   * @param options 趋势选项
   * @returns 趋势仓库列表
   */
  async fetchTrends(options: TrendOptions = {}): Promise<Repository[]> {
    const { language, since = 'daily' } = options;

    let url = this.baseUrl;
    if (language) {
      url += `/${encodeURIComponent(language)}`;
    }
    url += `?since=${since}`;

    try {
      const { data } = await axios.get(url);
      return this.parseHTML(data, options);
    } catch (error) {
      console.error('Error fetching GitHub trends:', error);
      throw new Error(`Failed to fetch GitHub trends: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 解析HTML获取趋势仓库数据
   * @param html GitHub趋势页面HTML
   * @param options 趋势选项
   * @returns 趋势仓库列表
   */
  private parseHTML(html: string, options: TrendOptions): Repository[] {
    const $ = cheerio.load(html);
    const repositories: Repository[] = [];
    const { limit = 25, topics } = options;

    $('article.Box-row').each((index, element) => {
      if (repositories.length >= limit) return false;

      const $element = $(element);
      const nameElement = $element.find('h2.h3 a');
      const relativePath = nameElement.attr('href')?.substring(1);

      if (!relativePath) return;

      // 从相对路径中提取作者和仓库名
      const pathParts = relativePath.split('/');
      const author = pathParts[0];
      const name = pathParts[1];
      const url = `https://github.com/${relativePath}`;
      const description = $element.find('p')?.text()?.trim() || '';

      const languageElement = $element.find('[itemprop="programmingLanguage"]');
      const language = languageElement.text().trim();

      const starsElement = $element.find('a.Link--muted:nth-child(1)');
      const stars = this.extractNumber(starsElement.text().trim());

      const forksElement = $element.find('a.Link--muted:nth-child(2)');
      const forks = this.extractNumber(forksElement.text().trim());

      const starsGainedElement = $element.find('span.d-inline-block.float-sm-right');
      const starsInPeriod = this.extractNumber(starsGainedElement.text().trim());

      const avatar = $element.find('img.avatar').attr('src');

      // 匹配topics过滤
      if (topics && topics.length > 0) {
        // 理想情况下应该解析出仓库的topics标签，但这需要额外请求
        // 这里简化实现，仅检查描述中是否包含topics中的关键词
        const hasMatchingTopic = topics.some(
          (topic) =>
            description.toLowerCase().includes(topic.toLowerCase()) || name.toLowerCase().includes(topic.toLowerCase()),
        );

        if (!hasMatchingTopic) return;
      }

      repositories.push({
        rank: index + 1,
        name,
        author,
        url,
        description,
        language,
        stars,
        forks,
        starsInPeriod,
        avatar,
      });
    });

    return repositories;
  }

  /**
   * 从字符串中提取数字
   * @param str 包含数字的字符串
   * @returns 提取的数字
   */
  private extractNumber(str: string): number {
    const matches = str.match(/[\d,]+/);
    if (!matches) return 0;
    return parseInt(matches[0].replace(/,/g, ''), 10);
  }
}
