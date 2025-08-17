"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogMiddleware = requestLogMiddleware;
const logger_1 = require("../logger");
const logger = new logger_1.Logger();
function nowNs() {
    return process.hrtime.bigint();
}
function toMs(deltaNs) {
    return Number(deltaNs) / 1e6;
}
/**
 * Minimal access log:
 * - one line on response finish
 * - stdout only, no files
 * - enable via adapterOptions.requestLog = true
 */
function requestLogMiddleware(req, res, next) {
    const start = nowNs();
    const method = (req.method ?? '-').toUpperCase();
    const url = req.url ?? '-';
    const remote = (req.socket && req.socket.remoteAddress) || '-';
    const rid = req.requestId ? `[${req.requestId}] ` : '';
    res.on('finish', () => {
        const ms = toMs(nowNs() - start).toFixed(3);
        const length = res.getHeader('content-length') ?? '-';
        const status = res.statusCode;
        logger.http(`${rid}[${method}] [${url}] [${remote}] [${status}] [${length}] [${ms} ms]`);
    });
    next();
}
//# sourceMappingURL=requestLog.middleware.js.map