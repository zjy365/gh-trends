import fs from 'fs'
import os from 'os'
import path from 'path'

import { Config, ConfigOptions } from '@/types/config'

import { defaultConfig } from './default'

/**
 * Config Manager
 */
export class ConfigManager {
  private config: Config
  private configPath: string

  constructor(options?: ConfigOptions) {
    // Default config path
    this.configPath = options?.configPath || path.join(os.homedir(), '.gh-explorer', 'config.json')

    // Initialize config
    this.config = this.loadConfig()
  }

  /**
   * Get config
   */
  getConfig(): Config {
    return this.config
  }

  /**
   * Load config file
   */
  private loadConfig(): Config {
    try {
      // If config file exists, read and merge config
      if (fs.existsSync(this.configPath)) {
        const userConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'))
        return this.mergeConfig(defaultConfig, userConfig)
      }
    } catch (error) {
      console.error(`加载配置文件失败: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Return default config
    return { ...defaultConfig }
  }

  /**
   * Merge config
   */
  private mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
    const mergedConfig = { ...defaultConfig }

    // Merge GitHub config
    if (userConfig.github) {
      mergedConfig.github = {
        ...mergedConfig.github,
        ...userConfig.github
      }
    }

    // Merge output config
    if (userConfig.output) {
      mergedConfig.output = {
        ...mergedConfig.output,
        ...userConfig.output
      }
    }

    // Merge AI config
    if (userConfig.ai) {
      mergedConfig.ai = {
        ...mergedConfig.ai,
        ...userConfig.ai
      }
    }

    // Merge cache config
    if (userConfig.cache) {
      mergedConfig.cache = {
        ...mergedConfig.cache,
        ...userConfig.cache
      }
    }

    return mergedConfig
  }
}

// Export default instance
const configManager = new ConfigManager()

/**
 * Get config
 */
export function getConfig(): Config {
  return configManager.getConfig()
}
