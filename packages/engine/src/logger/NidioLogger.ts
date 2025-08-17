import type { ILogger, LoggerLevel, LoggerOptions } from './types';
import { ANSI, buildTimestamp } from './logger.utils';

/**
 * Pretty dev logger: one-line, optional colors, zero deps.
 * Methods are pre-bound at construction for O(1) per log call.
 */
export class NidioLogger implements ILogger {
  private readonly context?: string;
  private readonly threshold: number;
  private readonly colorize: boolean;
  private readonly writeOut: (s: string) => void;
  private readonly writeErr: (s: string) => void;

  public debug: (m: string) => void = () => {};
  public info: (m: string) => void = () => {};
  public http: (m: string) => void = () => {};
  public warn: (m: string) => void = () => {};
  public error: (e: unknown) => void = () => {};

  constructor(context?: string, options?: LoggerOptions, io?: { out: (s: string) => void; err: (s: string) => void }) {
    this.context = context && context.length ? context : undefined;

    const LEVEL_WEIGHT: Record<LoggerLevel, number> = { error: 0, warn: 1, info: 2, http: 2, debug: 3 };
    const level: LoggerLevel = options?.level ?? (process.env.LOG_LEVEL as LoggerLevel) ?? 'info';
    this.threshold = LEVEL_WEIGHT[level] ?? LEVEL_WEIGHT.info;

    this.colorize = options?.colorize ?? process.env.NODE_ENV !== 'production';

    // IO writers (provided by facade or default async)
    this.writeOut = io?.out ?? ((s) => process.stdout.write(s + '\n'));
    this.writeErr = io?.err ?? ((s) => process.stderr.write(s + '\n'));

    // Pre-bind based on threshold for zero branching later
    if (LEVEL_WEIGHT.debug <= this.threshold) this.debug = (m) => this.writeOut(this.line('debug', m));
    if (LEVEL_WEIGHT.info <= this.threshold) this.info = (m) => this.writeOut(this.line('info', m));
    if (LEVEL_WEIGHT.http <= this.threshold) this.http = (m) => this.writeOut(this.line('http', m));
    if (LEVEL_WEIGHT.warn <= this.threshold) this.warn = (m) => this.writeErr(this.line('warn', m));
    if (LEVEL_WEIGHT.error <= this.threshold) {
      this.error = (e) => {
        const msg = e instanceof Error ? (e.stack ?? e.message) : typeof e === 'string' ? e : String(e);
        this.writeErr(this.line('error', msg));
      };
    }
  }

  /** Build one raw line quickly: `[ts] [LEVEL] [Context] message` (+color if enabled). */
  private line(level: LoggerLevel, message: string): string {
    const ts = buildTimestamp(new Date());
    const label = { error: 'ERROR', warn: 'WARN', info: 'INFO', http: 'HTTP', debug: 'DEBUG' }[level];
    const ctx = this.context ? ` [${this.context}]` : '';
    if (!this.colorize) return `${ts} [${label}]${ctx} ${message}`;
    const color = { error: ANSI.red, warn: ANSI.yellow, info: ANSI.green, http: ANSI.magenta, debug: ANSI.white }[
      level
    ];
    return `${ANSI.dim}${ts}${ANSI.reset} [${color}${label}${ANSI.reset}]${ctx} ${color}${message}${ANSI.reset}`;
  }
}
