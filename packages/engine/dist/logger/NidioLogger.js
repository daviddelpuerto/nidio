"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NidioLogger = void 0;
const logger_utils_1 = require("./logger.utils");
/**
 * Pretty dev logger: one-line, optional colors, zero deps.
 * Methods are pre-bound at construction for O(1) per log call.
 */
class NidioLogger {
    context;
    threshold;
    colorize;
    writeOut;
    writeErr;
    debug = () => { };
    info = () => { };
    http = () => { };
    warn = () => { };
    error = () => { };
    constructor(context, options, io) {
        this.context = context && context.length ? context : undefined;
        const LEVEL_WEIGHT = { error: 0, warn: 1, info: 2, http: 2, debug: 3 };
        const level = options?.level ?? process.env.LOG_LEVEL ?? 'info';
        this.threshold = LEVEL_WEIGHT[level] ?? LEVEL_WEIGHT.info;
        this.colorize = options?.colorize ?? process.env.NODE_ENV !== 'production';
        // IO writers (provided by facade or default async)
        this.writeOut = io?.out ?? ((s) => process.stdout.write(s + '\n'));
        this.writeErr = io?.err ?? ((s) => process.stderr.write(s + '\n'));
        // Pre-bind based on threshold for zero branching later
        if (LEVEL_WEIGHT.debug <= this.threshold)
            this.debug = (m) => this.writeOut(this.line('debug', m));
        if (LEVEL_WEIGHT.info <= this.threshold)
            this.info = (m) => this.writeOut(this.line('info', m));
        if (LEVEL_WEIGHT.http <= this.threshold)
            this.http = (m) => this.writeOut(this.line('http', m));
        if (LEVEL_WEIGHT.warn <= this.threshold)
            this.warn = (m) => this.writeErr(this.line('warn', m));
        if (LEVEL_WEIGHT.error <= this.threshold) {
            this.error = (e) => {
                const msg = e instanceof Error ? (e.stack ?? e.message) : typeof e === 'string' ? e : String(e);
                this.writeErr(this.line('error', msg));
            };
        }
    }
    /** Build one raw line quickly: `[ts] [LEVEL] [Context] message` (+color if enabled). */
    line(level, message) {
        const ts = (0, logger_utils_1.buildTimestamp)(new Date());
        const label = { error: 'ERROR', warn: 'WARN', info: 'INFO', http: 'HTTP', debug: 'DEBUG' }[level];
        const ctx = this.context ? ` [${this.context}]` : '';
        if (!this.colorize)
            return `${ts} [${label}]${ctx} ${message}`;
        const color = { error: logger_utils_1.ANSI.red, warn: logger_utils_1.ANSI.yellow, info: logger_utils_1.ANSI.green, http: logger_utils_1.ANSI.magenta, debug: logger_utils_1.ANSI.white }[level];
        return `${logger_utils_1.ANSI.dim}${ts}${logger_utils_1.ANSI.reset} [${color}${label}${logger_utils_1.ANSI.reset}]${ctx} ${color}${message}${logger_utils_1.ANSI.reset}`;
    }
}
exports.NidioLogger = NidioLogger;
//# sourceMappingURL=NidioLogger.js.map