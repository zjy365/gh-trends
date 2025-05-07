import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

import { getConfig } from '../../config/manager';
import { formatMetadataOutput } from '../../formatters/formatter';
import { enrichMetadataWithAI } from '../../services/ai/enricher';
import { extractMetadata } from '../../services/metadata/extractor';
import { OutputFormat } from '../../types/output';
import { saveToFile } from '../../utils/file';
import { validateUrl } from '../../utils/validator';

/**
 * 注册URL命令
 * @param program Commander实例
 */
export function registerUrlCommand(program: Command): void {
  program
    .command('url <url>')
    .description('分析 URL 元数据')
    .option('-f, --format <format>', '输出格式 (json, table, markdown)', 'table')
    .option('-o, --output <path>', '输出到文件')
    .option('-d, --depth <depth>', '分析深度 (basic, normal, deep)', 'normal')
    .option('--ai', '启用 AI 分析', true)
    .option('--no-ai', '禁用 AI 分析')
    .action(async (url, options) => {
      await handleUrlCommand(url, options);
    });
}

/**
 * 处理URL命令
 * @param url URL地址
 * @param options 命令选项
 */
async function handleUrlCommand(url: string, options: any): Promise<void> {
  const spinner = ora('处理中...').start();

  try {
    // 获取配置和合并选项
    const config = getConfig();

    // 解析深度
    let depth: 'basic' | 'normal' | 'deep' = 'normal';
    if (options.depth && ['basic', 'normal', 'deep'].includes(options.depth)) {
      depth = options.depth as 'basic' | 'normal' | 'deep';
    }

    // 解析输出格式
    let format: OutputFormat = config.output.defaultFormat;
    if (options.format) {
      format = options.format as OutputFormat;
    }

    const urlOptions = {
      enableAI: options.ai !== false,
      format,
      outputPath: options.output,
      depth,
    };

    // URL 验证
    spinner.text = '验证 URL...';
    if (!validateUrl(url)) {
      spinner.fail(chalk.red('无效的 URL 格式'));
      process.exit(1);
    }

    // 内容获取与元数据提取
    spinner.text = '获取并分析内容...';
    const metadata = await extractMetadata(url, {
      depth: urlOptions.depth,
      includeImages: urlOptions.depth !== 'basic',
      timeout: 30000,
    });

    // AI 增强（如果启用）
    let enrichedMetadata = metadata;
    if (urlOptions.enableAI && config.ai.apiKey) {
      spinner.text = '进行 AI 分析...';
      enrichedMetadata = await enrichMetadataWithAI(metadata, {
        model: config.ai.defaultModel,
        summaryLength: config.ai.summaryLength,
      });
    }

    // 格式化输出
    spinner.succeed('分析完成!');
    const formattedOutput = formatMetadataOutput(enrichedMetadata, {
      format: urlOptions.format,
      colorEnabled: config.output.colorEnabled,
      period: '', // 不需要但格式化器需要这个参数
      language: metadata.language,
    });

    // 输出结果
    if (urlOptions.outputPath) {
      await saveToFile(formattedOutput, urlOptions.outputPath, urlOptions.format);
      console.log(chalk.green(`结果已保存到: ${urlOptions.outputPath}`));
    } else {
      console.log(formattedOutput);
    }
  } catch (error) {
    spinner.fail(chalk.red(`错误: ${(error as Error).message}`));
    process.exit(1);
  }
}
