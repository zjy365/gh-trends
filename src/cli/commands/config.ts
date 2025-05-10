import { Command } from 'commander'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import os from 'os'

import { getConfig } from '@/config/manager'
import { defaultConfig } from '@/config/default'
import { Config } from '@/types/config'

/**
 * Register config commands
 * @param program Commander instance
 */
export function registerConfigCommand(program: Command): void {
  const configCmd = program.command('config').description('Manage configuration')

  // Set config
  configCmd
    .command('set <key> <value>')
    .description('Set a config value, e.g. ai.apiKey YOUR_API_KEY')
    .action((key, value) => {
      try {
        setConfig(key, value)
        console.log(chalk.green(`✔ Successfully set ${key}`))

        // Provide additional guidance for AI API Key
        if (key === 'ai.apiKey' && value) {
          console.log(
            chalk.blue('Tip: You need to enable AI: `gh-explorer config set ai.enabled true`')
          )
        }
      } catch (error) {
        console.error(chalk.red(`✘ Setting failed: ${(error as Error).message}`))
        process.exit(1)
      }
    })

  // Get config
  configCmd
    .command('get [key]')
    .description('Get a config value, or all config if no key specified')
    .action((key) => {
      try {
        const config = getConfig()
        if (!key) {
          // Print all config (filtering sensitive information)
          const safeConfig = { ...config }
          if (safeConfig.ai?.apiKey) {
            safeConfig.ai.apiKey = safeConfig.ai.apiKey.slice(0, 4) + '...'
          }
          console.log(JSON.stringify(safeConfig, null, 2))
          return
        }

        // Print specific config value
        const value = getConfigValue(config, key)
        if (value === undefined) {
          console.log(chalk.yellow(`Config key not found: ${key}`))
          return
        }

        // Mask API Key partially
        if (key === 'ai.apiKey' && typeof value === 'string' && value.length > 0) {
          console.log(`${key}: ${value.slice(0, 4)}...`)
        } else {
          console.log(`${key}: ${JSON.stringify(value)}`)
        }
      } catch (error) {
        console.error(chalk.red(`✘ Get failed: ${(error as Error).message}`))
        process.exit(1)
      }
    })

  // Help command with examples
  configCmd
    .command('help')
    .description('Show configuration help and examples')
    .action(() => {
      console.log(chalk.bold('Configuration Help & Examples:'))
      console.log('')
      console.log(chalk.blue('Set OpenAI API Key:'))
      console.log('  gh-explorer config set ai.apiKey YOUR_API_KEY')
      console.log('')
      console.log(chalk.blue('Set custom OpenAI API URL (optional):'))
      console.log('  gh-explorer config set ai.baseURL https://your-api-url')
      console.log('')
      console.log(chalk.blue('Enable AI features:'))
      console.log('  gh-explorer config set ai.enabled true')
      console.log('')
      console.log(chalk.blue('View current configuration:'))
      console.log('  gh-explorer config get')
      console.log('')
      console.log(
        chalk.yellow(
          'Note: AI features are disabled by default. You need to enable them after setting an API key.'
        )
      )
    })
}

/**
 * Set a config value
 * @param key Config key in dot notation, e.g. 'ai.apiKey'
 * @param value Config value
 */
function setConfig(key: string, value: string): void {
  // Get config file path
  const configDir = path.join(os.homedir(), '.gh-explorer')
  const configPath = path.join(configDir, 'config.json')

  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  // Read existing config or create from defaults
  let config: Record<string, any> = {}
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8')
      config = JSON.parse(content)
    } catch (error) {
      throw new Error(`Failed to read config file: ${(error as Error).message}`)
    }
  } else {
    // If config file doesn't exist, create a new one from defaults
    config = JSON.parse(JSON.stringify(defaultConfig))
  }

  // Parse key with dot notation
  const keys = key.split('.')
  let current = config

  // Traverse key path, ensuring all objects exist
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (!current[k] || typeof current[k] !== 'object') {
      current[k] = {}
    }
    current = current[k]
  }

  // Set value
  const lastKey = keys[keys.length - 1]

  // Handle special value types
  if (value.toLowerCase() === 'true') {
    current[lastKey] = true
  } else if (value.toLowerCase() === 'false') {
    current[lastKey] = false
  } else if (!isNaN(Number(value)) && value.trim() !== '') {
    current[lastKey] = Number(value)
  } else {
    current[lastKey] = value
  }

  // Write config file
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
      mode: 0o600
    })
  } catch (error) {
    throw new Error(`Failed to write config file: ${(error as Error).message}`)
  }
}

/**
 * Get a config value
 * @param config Config object
 * @param key Config key in dot notation
 * @returns Config value
 */
function getConfigValue(config: Record<string, any>, key: string): any {
  const keys = key.split('.')
  let value = config

  for (const k of keys) {
    if (value === undefined || value === null || typeof value !== 'object') {
      return undefined
    }
    value = value[k]
  }

  return value
}
