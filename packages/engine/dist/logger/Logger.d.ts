import type { ILogger, LoggerOptions } from './types';
/**
 * Logger facade:
 * - auto picks Pino (prod) or Nidio (dev) unless overridden
 * - wires async/sync writers for Nidio
 * - pre-binds methods to remove branches from the hot path
 */
export declare class Logger implements ILogger {
    debug: (m: string) => void;
    info: (m: string) => void;
    http: (m: string) => void;
    warn: (m: string) => void;
    error: (e: unknown) => void;
    constructor(context?: string, options?: LoggerOptions);
}
//# sourceMappingURL=Logger.d.ts.map