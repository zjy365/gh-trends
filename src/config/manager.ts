import fs from 'fs';
import os from 'os';
import path from 'path';

import { Config, ConfigOptions } from '../types/config';

import { defaultConfig } from './default';

/**
 * 配置管理器类
 */
export class ConfigManager {
  private config: Config;
  private configPath: string;

  constructor(options?: ConfigOptions) {
    // 默认配置路径
    this.configPath = options?.configPath || path.join(os.homedir(), '.gittrend', 'config.json');

    // 初始化配置
    this.config = this.loadConfig();
  }

  /**
   * 获取配置
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * 加载配置文件
   */
  private loadConfig(): Config {
    try {
      // 如果配置文件存在，读取并合并配置
      if (fs.existsSync(this.configPath)) {
        const userConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        return this.mergeConfig(defaultConfig, userConfig);
      }
    } catch (error) {
      console.error(`加载配置文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 返回默认配置
    return { ...defaultConfig };
  }

  /**
   * 合并配置
   */
  private mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
    const mergedConfig = { ...defaultConfig };

    // 合并GitHub配置
    if (userConfig.github) {
      mergedConfig.github = {
        ...mergedConfig.github,
        ...userConfig.github,
      };
    }

    // 合并输出配置
    if (userConfig.output) {
      mergedConfig.output = {
        ...mergedConfig.output,
        ...userConfig.output,
      };
    }

    // 合并AI配置
    if (userConfig.ai) {
      mergedConfig.ai = {
        ...mergedConfig.ai,
        ...userConfig.ai,
      };
    }

    // 合并缓存配置
    if (userConfig.cache) {
      mergedConfig.cache = {
        ...mergedConfig.cache,
        ...userConfig.cache,
      };
    }

    return mergedConfig;
  }
}

// 导出默认实例
const configManager = new ConfigManager();

/**
 * 获取配置
 */
export function getConfig(): Config {
  return configManager.getConfig();
}
