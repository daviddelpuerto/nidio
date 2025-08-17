"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writers = exports.ANSI = void 0;
exports.buildTimestamp = buildTimestamp;
const node_fs_1 = require("node:fs");
exports.ANSI = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
};
const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
const pad3 = (n) => (n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n);
function buildTimestamp(now) {
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
function write(toErr, line) {
    const needsNL = line.charCodeAt(line.length - 1) !== 10; // '\n'
    (toErr ? process.stderr : process.stdout).write(needsNL ? line + '\n' : line);
}
function writeSyncLine(toErr, line) {
    const needsNL = line.charCodeAt(line.length - 1) !== 10;
    (0, node_fs_1.writeSync)(toErr ? 2 : 1, needsNL ? line + '\n' : line);
}
exports.writers = {
    asyncOut: (s) => write(false, s),
    asyncErr: (s) => write(true, s),
    syncOut: (s) => writeSyncLine(false, s),
    syncErr: (s) => writeSyncLine(true, s),
};
//# sourceMappingURL=logger.utils.js.map