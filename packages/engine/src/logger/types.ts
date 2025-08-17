export type LoggerLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';
export type LoggerFormat = 'raw' | 'json';
export type JsonTime = 'epoch' | 'iso';

export interface LoggerOptions {
  /** Minimum level to output. Default: env.LOG_LEVEL or 'info'. */
  level?: LoggerLevel;
  /** Force format (overrides env): 'json' → Pino, 'raw' → Nidio. */
  format?: LoggerFormat;
  /** Force sync writes to stdio. Default: false (async). */
  sync?: boolean;
  /** Colorize raw output (Nidio only). Default: !production. */
  colorize?: boolean;
  /** JSON timestamp strategy for Pino. Default: 'epoch'. */
  jsonTime?: JsonTime;
  /** Implementation selector. 'auto' → prod:Pino, dev:Nidio. */
  impl?: 'auto' | 'pino' | 'nidio';
}

export interface ILogger {
  debug(message: string): void;
  info(message: string): void;
  http(message: string): void; // treated as 'info' severity
  warn(message: string): void;
  error(error: string | Error | unknown): void;
}
