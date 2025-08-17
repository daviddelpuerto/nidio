"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
/* eslint-disable @typescript-eslint/no-explicit-any */
const node_crypto_1 = require("node:crypto");
/**
 * Sets a requestId for the request lifecycle.
 * - Reuses incoming X-Request-Id if present.
 * - Otherwise generates a UUID exposed on req.requestId.
 */
function requestIdMiddleware(req, _res, next) {
    const requestIdHeader = req.headers['x-request-id'];
    const requestId = typeof requestIdHeader === 'string' && requestIdHeader.length > 0
        ? requestIdHeader
        : typeof node_crypto_1.randomUUID === 'function'
            ? (0, node_crypto_1.randomUUID)()
            : Math.random().toString(36).slice(2);
    req.requestId = requestId;
    next();
}
//# sourceMappingURL=requestId.middleware.js.map