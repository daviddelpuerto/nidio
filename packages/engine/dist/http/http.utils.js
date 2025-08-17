"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionPrefix = versionPrefix;
exports.joinPaths = joinPaths;
exports.normalizeError = normalizeError;
exports.writeResponse = writeResponse;
const toolkit_1 = require("@nidio/toolkit");
const logger_1 = require("../logger");
const logger = new logger_1.Logger();
/** Build version prefix `/v{version}` or empty string. */
function versionPrefix(version) {
    if (version === undefined || version === null)
        return '';
    const v = String(version).trim();
    return v ? `/v${v}` : '';
}
/** Join URL path parts, normalizing slashes and ensuring a leading slash. */
function joinPaths(...parts) {
    let out = parts.filter(Boolean).join('');
    out = out.replace(/\/{2,}/g, '/');
    if (!out.startsWith('/'))
        out = `/${out}`;
    return out;
}
/**
 * Convert any thrown value into a stable HTTP error response.
 * - HttpException → { statusCode, error, message, details? }
 * - Unhandled     → 500 + { statusCode, error, message }
 */
function normalizeError(err, requestId) {
    const rid = requestId ? `[${requestId}]` : '[-]';
    if (err instanceof toolkit_1.HttpException) {
        const status = err.getStatus();
        const response = err.getResponse();
        const message = response && typeof response === 'object' && 'message' in response
            ? response.message
            : err.message;
        const details = response && typeof response === 'object' && 'details' in response
            ? response.details
            : undefined;
        const body = {
            statusCode: status,
            error: err.name ?? 'Error',
            message,
        };
        if (details !== undefined)
            body.details = details;
        logger.error(`[${err.name ?? 'HttpException'}] ${rid} ${err.message}`);
        return { status, body };
    }
    // Unhandled errors
    const original = err instanceof Error ? (err.stack ?? err.message) : String(err);
    logger.error(`[UnhandledError] ${rid} ${original}`);
    return {
        status: 500,
        body: {
            statusCode: 500,
            error: 'InternalServerError',
            message: 'Internal Server Error',
        },
    };
}
/** Write payload as a text or JSON response (no body for 204/304). */
function writeResponse(res, statusCode, payload) {
    if (statusCode === 204 || statusCode === 304) {
        res.statusCode = statusCode;
        res.end();
        return;
    }
    if (typeof payload === 'string') {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(payload);
        return;
    }
    if (Buffer.isBuffer(payload)) {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.end(payload);
        return;
    }
    // default JSON
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
}
//# sourceMappingURL=http.utils.js.map