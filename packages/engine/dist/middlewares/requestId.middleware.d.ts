import type { FrameworkRequest, FrameworkResponse } from '../http/adapters/HttpAdapter';
/**
 * Sets a requestId for the request lifecycle.
 * - Reuses incoming X-Request-Id if present.
 * - Otherwise generates a UUID exposed on req.requestId.
 */
export declare function requestIdMiddleware(req: FrameworkRequest, _res: FrameworkResponse, next: (err?: any) => void): void;
//# sourceMappingURL=requestId.middleware.d.ts.map