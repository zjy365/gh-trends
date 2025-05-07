import fs from 'fs/promises';
import path from 'path';

import { OutputFormat } from '../types/output';

/**
 * 保存内容到文件
 * @param content 文件内容
 * @param filePath 文件路径
 * @param format 输出格式
 */
export async function saveToFile(content: string, filePath: string, format: OutputFormat): Promise<void> {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true }).catch(() => {});

    // 如果未指定扩展名，添加默认扩展名
    let outputPath = filePath;
    if (!path.extname(filePath)) {
      const extension = getExtensionForFormat(format);
      outputPath = `${filePath}${extension}`;
    }

    // 写入文件
    await fs.writeFile(outputPath, content, 'utf-8');
    return;
  } catch (error) {
    throw new Error(`保存文件失败: ${(error as Error).message}`);
  }
}

/**
 * 根据格式获取文件扩展名
 * @param format 输出格式
 * @returns 文件扩展名
 */
function getExtensionForFormat(format: OutputFormat): string {
  switch (format) {
    case 'json':
      return '.json';
    case 'markdown':
      return '.md';
    case 'table':
    default:
      return '.txt';
  }
}
