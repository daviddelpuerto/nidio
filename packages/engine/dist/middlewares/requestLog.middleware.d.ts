import type { FrameworkRequest, FrameworkResponse } from '../http/adapters/HttpAdapter';
/**
 * Minimal access log:
 * - one line on response finish
 * - stdout only, no files
 * - enable via adapterOptions.requestLog = true
 */
export declare function requestLogMiddleware(req: FrameworkRequest, res: FrameworkResponse, next: (err?: any) => void): void;
//# sourceMappingURL=requestLog.middleware.d.ts.map