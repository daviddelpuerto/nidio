import type { ILogger, LoggerOptions } from './types';
/**
 * Pretty dev logger: one-line, optional colors, zero deps.
 * Methods are pre-bound at construction for O(1) per log call.
 */
export declare class NidioLogger implements ILogger {
    private readonly context?;
    private readonly threshold;
    private readonly colorize;
    private readonly writeOut;
    private readonly writeErr;
    debug: (m: string) => void;
    info: (m: string) => void;
    http: (m: string) => void;
    warn: (m: string) => void;
    error: (e: unknown) => void;
    constructor(context?: string, options?: LoggerOptions, io?: {
        out: (s: string) => void;
        err: (s: string) => void;
    });
    /** Build one raw line quickly: `[ts] [LEVEL] [Context] message` (+color if enabled). */
    private line;
}
//# sourceMappingURL=NidioLogger.d.ts.map