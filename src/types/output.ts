export type OutputFormat = 'json' | 'table' | 'markdown';

export interface FormatOptions {
  format: OutputFormat;
  colorEnabled: boolean;
  period: string;
  language?: string;
}

export interface OutputOptions {
  format: OutputFormat;
  outputPath?: string;
}
