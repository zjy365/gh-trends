import { Config } from '../types/config';

/**
 * 默认配置
 */
export const defaultConfig: Config = {
  github: {
    defaultPeriod: 'daily',
    defaultLimit: 25,
  },
  output: {
    defaultFormat: 'table',
    colorEnabled: true,
  },
  ai: {
    enabled: false,
    defaultModel: 'gpt-3.5-turbo',
    summaryLength: 'medium',
  },
  cache: {
    enabled: true,
    ttl: 3600, // 1小时
    maxSize: 100,
  },
};
