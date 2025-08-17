import { writeSync } from 'node:fs';

export const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
} as const;

const pad2 = (n: number) => (n < 10 ? '0' + n : '' + n);
const pad3 = (n: number) => (n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n);

export function buildTimestamp(now: Date): string {
  const y = now.getFullYear();
  const m = pad2(now.getMonth() + 1);
  const d = pad2(now.getDate());
  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());
  const ms = pad3(now.getMilliseconds());
  const tzMin = -now.getTimezoneOffset();
  const sign = tzMin >= 0 ? '+' : '-';
  const tzAbs = tzMin >= 0 ? tzMin : -tzMin;
  const tzh = pad2((tzAbs / 60) | 0);
  const tzm = pad2(tzAbs % 60);
  return `[${y}-${m}-${d} ${hh}:${mm}:${ss}.${ms} ${sign}${tzh}${tzm}]`;
}

function write(toErr: boolean, line: string): void {
  const needsNL = line.charCodeAt(line.length - 1) !== 10; // '\n'
  (toErr ? process.stderr : process.stdout).write(needsNL ? line + '\n' : line);
}

function writeSyncLine(toErr: boolean, line: string): void {
  const needsNL = line.charCodeAt(line.length - 1) !== 10;
  writeSync(toErr ? 2 : 1, needsNL ? line + '\n' : line);
}

export const writers = {
  asyncOut: (s: string) => write(false, s),
  asyncErr: (s: string) => write(true, s),
  syncOut: (s: string) => writeSyncLine(false, s),
  syncErr: (s: string) => writeSyncLine(true, s),
};
