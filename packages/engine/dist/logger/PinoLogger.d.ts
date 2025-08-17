import type { ILogger, LoggerOptions } from './types';
/**
 * Structured JSON logger for production. Async (sonic-boom) by default.
 * `http()` is mapped to `info()` so access logs appear at default level.
 */
export declare class PinoLogger implements ILogger {
    private readonly log;
    constructor(context?: string, options?: LoggerOptions);
    debug(m: string): void;
    info(m: string): void;
    http(m: string): void;
    warn(m: string): void;
    error(e: unknown): void;
}
//# sourceMappingURL=PinoLogger.d.ts.map