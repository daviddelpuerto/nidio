import type { FrameworkResponse } from './adapters/HttpAdapter';
/** Build version prefix `/v{version}` or empty string. */
export declare function versionPrefix(version: string | number | undefined): string;
/** Join URL path parts, normalizing slashes and ensuring a leading slash. */
export declare function joinPaths(...parts: Array<string | undefined>): string;
/**
 * Convert any thrown value into a stable HTTP error response.
 * - HttpException → { statusCode, error, message, details? }
 * - Unhandled     → 500 + { statusCode, error, message }
 */
export declare function normalizeError(err: unknown, requestId?: string): {
    status: number;
    body: unknown;
};
/** Write payload as a text or JSON response (no body for 204/304). */
export declare function writeResponse(res: FrameworkResponse, statusCode: number, payload?: unknown): void;
//# sourceMappingURL=http.utils.d.ts.map