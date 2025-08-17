import pino, { Logger as Pino, stdTimeFunctions } from 'pino';
import type { ILogger, LoggerOptions } from './types';

/**
 * Structured JSON logger for production. Async (sonic-boom) by default.
 * `http()` is mapped to `info()` so access logs appear at default level.
 */
export class PinoLogger implements ILogger {
  private readonly log: Pino;

  constructor(context?: string, options?: LoggerOptions) {
    const level = options?.level ?? process.env.LOG_LEVEL ?? 'info';
    const sync = options?.sync ?? process.env.LOG_SYNC === 'true';
    const jsonTime = options?.jsonTime ?? 'epoch';

    const dest = pino.destination({ sync });
    const base = pino(
      {
        level,
        timestamp: jsonTime === 'iso' ? stdTimeFunctions.isoTime : stdTimeFunctions.epochTime,
        formatters: {
          level(label, number) {
            return { level: number, levelName: label };
          },
        },
      },
      dest,
    );

    this.log = context && context.length ? base.child({ ctx: context }) : base;
  }

  debug(m: string): void {
    this.log.debug(m);
  }
  info(m: string): void {
    this.log.info(m);
  }
  http(m: string): void {
    this.log.info(m);
  }
  warn(m: string): void {
    this.log.warn(m);
  }
  error(e: unknown): void {
    if (e instanceof Error) this.log.error(e);
    else this.log.error(String(e));
  }
}
