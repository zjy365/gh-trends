import { TrendOptions } from '../types/github';

/**
 * 验证GitHub趋势选项
 * @param options 趋势选项
 */
export function validateTrendingOptions(options: TrendOptions): void {
  // 验证时间周期
  if (options.since && !['daily', 'weekly', 'monthly'].includes(options.since)) {
    throw new Error('无效的时间周期，请使用 daily、weekly 或 monthly');
  }

  // 验证限制数量
  if (options.limit && (isNaN(options.limit) || options.limit < 1 || options.limit > 100)) {
    throw new Error('无效的限制数量，请使用 1-100 之间的数字');
  }
}

/**
 * 验证输出格式
 * @param format 输出格式
 */
export function validateOutputFormat(format: string): void {
  if (!['json', 'table', 'markdown'].includes(format)) {
    throw new Error('无效的输出格式，请使用 json、table 或 markdown');
  }
}

/**
 * 验证URL
 * @param url URL字符串
 * @returns 是否是有效的URL
 */
export function validateUrl(url: string): boolean {
  try {
    // 创建 URL 对象来验证 URL
    const urlObj = new URL(url);

    // 确保协议是 http 或 https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}
