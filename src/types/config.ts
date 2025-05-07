export interface Config {
  github: {
    defaultLanguage?: string;
    defaultPeriod: 'daily' | 'weekly' | 'monthly';
    defaultLimit: number;
  };
  output: {
    defaultFormat: 'json' | 'table' | 'markdown';
    colorEnabled: boolean;
  };
  ai: {
    enabled: boolean;
    apiKey?: string;
    defaultModel: string;
    summaryLength: 'short' | 'medium' | 'long';
  };
  cache: {
    enabled: boolean;
    ttl: number; // seconds
    maxSize: number;
  };
}

export interface ConfigOptions {
  configPath?: string;
}
