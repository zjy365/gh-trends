import axios from 'axios';
import * as cheerio from 'cheerio';

import { Metadata, ExtractionOptions } from '../../types/metadata';
import { cacheGet, cacheSet } from '../../utils/cache';

/**
 * 提取URL元数据
 * @param url URL地址
 * @param options 提取选项
 * @returns Promise<Metadata> 元数据对象
 */
export async function extractMetadata(url: string, options: ExtractionOptions): Promise<Metadata> {
  // 构建缓存键
  const cacheKey = `metadata:${url}:${options.depth}`;

  // 检查缓存
  const cachedData = cacheGet(cacheKey);
  if (cachedData) {
    return cachedData as Metadata;
  }

  try {
    // 获取页面内容
    const pageContent = await getPageContent(url, options.timeout);

    // 解析元数据
    const metadata = parseMetadata(url, pageContent, options);

    // 缓存结果
    cacheSet(cacheKey, metadata, 3600); // 缓存一小时

    return metadata;
  } catch (error) {
    throw new Error(`提取元数据失败: ${(error as Error).message}`);
  }
}

/**
 * 获取页面内容
 * @param url URL地址
 * @param timeout 超时时间(毫秒)
 * @returns Promise<string> 页面HTML内容
 */
export async function getPageContent(url: string, timeout = 30000): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'gittrend-cli/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
      timeout,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`获取内容失败: HTTP 状态码 ${error.response.status}`);
    }
    throw new Error(`获取内容失败: ${(error as Error).message}`);
  }
}

/**
 * 解析HTML提取元数据
 * @param url 原始URL
 * @param html HTML内容
 * @param options 提取选项
 * @returns Metadata 元数据对象
 */
function parseMetadata(url: string, html: string, options: ExtractionOptions): Metadata {
  // 创建初始元数据对象
  const metadata: Metadata = {
    url,
    title: '',
    description: '',
  };

  // 加载 HTML
  const $ = cheerio.load(html);

  // 提取基本元数据
  metadata.title = $('title').text().trim() || '';
  metadata.description =
    $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

  // 提取其他基本元数据
  metadata.author =
    $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content') || undefined;

  metadata.publisher = $('meta[property="og:site_name"]').attr('content') || undefined;

  metadata.type = $('meta[property="og:type"]').attr('content') || undefined;

  // 提取图片（如果需要）
  if (options.includeImages) {
    metadata.image =
      $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || undefined;

    // 提取网站图标
    const iconLink = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');

    if (iconLink) {
      // 处理相对 URL
      metadata.icon = iconLink.startsWith('http') ? iconLink : new URL(iconLink, url).toString();
    }
  }

  // 提取关键词和标签
  const keywords = $('meta[name="keywords"]').attr('content');
  if (keywords) {
    metadata.keywords = keywords.split(',').map((k) => k.trim());
  }

  // 提取语言
  metadata.language = $('html').attr('lang') || undefined;

  // 提取日期信息
  const publishedTime = $('meta[property="article:published_time"]').attr('content');
  if (publishedTime) {
    metadata.published = new Date(publishedTime);
  }

  const modifiedTime = $('meta[property="article:modified_time"]').attr('content');
  if (modifiedTime) {
    metadata.modified = new Date(modifiedTime);
  }

  // 深度分析（当深度为 'deep' 时）
  if (options.depth === 'deep') {
    // 提取更多内容和结构信息...
    extractDeepMetadata($, metadata);
  }

  return metadata;
}

/**
 * 进行深度元数据提取
 * @param $ Cheerio实例
 * @param metadata 元数据对象
 */
function extractDeepMetadata($: cheerio.CheerioAPI, metadata: Metadata): void {
  // 提取主要内容文本（用于 AI 分析）
  const contentText: string[] = [];

  // 尝试找到主要内容区域
  const mainContent = $('article, main, .content, #content, .article');

  if (mainContent.length > 0) {
    // 有明确的内容区域
    mainContent.find('p, h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim();
      if (text) contentText.push(text);
    });
  } else {
    // 没有明确的内容区域，尝试获取页面上的所有段落
    $('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 40) contentText.push(text); // 只获取有意义的段落
    });
  }

  // 限制内容长度，避免过长
  metadata.contentPreview = contentText.join(' ').slice(0, 5000);

  // 尝试提取标签或分类
  const tags: string[] = [];
  $('a[rel="tag"], .tags a, .categories a, .topics a').each((_, element) => {
    const tag = $(element).text().trim();
    if (tag) tags.push(tag);
  });

  if (tags.length > 0) {
    metadata.tags = tags;
  }
}
