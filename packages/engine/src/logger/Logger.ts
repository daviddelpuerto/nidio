import type { ILogger, LoggerOptions } from './types';
import { NidioLogger } from './NidioLogger';
import { PinoLogger } from './PinoLogger';
import { writers } from './logger.utils';

/**
 * Logger facade:
 * - auto picks Pino (prod) or Nidio (dev) unless overridden
 * - wires async/sync writers for Nidio
 * - pre-binds methods to remove branches from the hot path
 */
export class Logger implements ILogger {
  public debug: (m: string) => void = () => {};
  public info: (m: string) => void = () => {};
  public http: (m: string) => void = () => {};
  public warn: (m: string) => void = () => {};
  public error: (e: unknown) => void = () => {};

  constructor(context?: string, options?: LoggerOptions) {
    const isProd = process.env.NODE_ENV === 'production';
    const impl = options?.impl ?? 'auto';
    const explicitFormat = options?.format;

    let implInstance: ILogger;

    // Choose implementation
    if (impl === 'pino' || explicitFormat === 'json' || (impl === 'auto' && isProd)) {
      implInstance = new PinoLogger(context, options);
    } else {
      const sync = options?.sync ?? process.env.LOG_SYNC === 'true';
      const io = sync
        ? { out: writers.syncOut, err: writers.syncErr }
        : { out: writers.asyncOut, err: writers.asyncErr };
      implInstance = new NidioLogger(context, options, io);
    }

    // Pre-bind for O(1)
    this.debug = implInstance.debug.bind(implInstance);
    this.info = implInstance.info.bind(implInstance);
    this.http = implInstance.http.bind(implInstance);
    this.warn = implInstance.warn.bind(implInstance);
    this.error = implInstance.error.bind(implInstance);
  }
}
