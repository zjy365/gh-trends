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
    this.configPath = options?.configPath || path.join(os.homedir(), '.gh-explorer', 'config.json')
    this.config = this.loadConfig()
  }

  getConfig(): Config {
    return this.config
  }

  private loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const userConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'))
        return this.mergeConfig(defaultConfig, userConfig)
      }
    } catch (error) {
      console.error(
        `load config file failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }

    return { ...defaultConfig }
  }

  private mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
    const mergedConfig = { ...defaultConfig }

    if (userConfig.github) {
      mergedConfig.github = {
        ...mergedConfig.github,
        ...userConfig.github
      }
    }

    if (userConfig.output) {
      mergedConfig.output = {
        ...mergedConfig.output,
        ...userConfig.output
      }
    }

    if (userConfig.ai) {
      mergedConfig.ai = {
        ...mergedConfig.ai,
        ...userConfig.ai
      }
    }

    if (userConfig.cache) {
      mergedConfig.cache = {
        ...mergedConfig.cache,
        ...userConfig.cache
      }
    }

    return mergedConfig
  }
}

const configManager = new ConfigManager()

export function getConfig(): Config {
  return configManager.getConfig()
}
