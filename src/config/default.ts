import { Config } from '@/types/config'

/**
 * default config
 */
export const defaultConfig: Config = {
  github: {
    defaultPeriod: 'daily',
    defaultLimit: 25
  },
  output: {
    defaultFormat: 'table',
    colorEnabled: true
  },
  ai: {
    enabled: false,
    defaultModel: 'gpt-4o-mini',
    summaryLength: 'medium'
  },
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 100
  }
}
