/** Default messages for common HTTP status codes. */
export declare const HTTP_STATUS_CODE_ERROR_MESSAGES: Record<number, string>;
/**
 * Base HTTP exception with a status and optional structured response payload.
 * The framework's error normalizer uses getStatus() and getResponse().
 */
export declare class HttpException extends Error {
    readonly status: number;
    readonly response?: unknown;
    constructor(status: number, message?: string, options?: {
        response?: unknown;
    });
    /** HTTP status code. */
    getStatus(): number;
    /**
     * Response payload to send to the client. Defaults to { message }.
     * Subclasses can pass a structured `response` object via the constructor options.
     */
    getResponse(): unknown;
}
//# sourceMappingURL=HttpException.d.ts.map