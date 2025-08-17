"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = exports.HTTP_STATUS_CODE_ERROR_MESSAGES = void 0;
/** Default messages for common HTTP status codes. */
exports.HTTP_STATUS_CODE_ERROR_MESSAGES = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
};
function getHttpCodeErrorMessage(status) {
    return exports.HTTP_STATUS_CODE_ERROR_MESSAGES[status] ?? 'Error';
}
/**
 * Base HTTP exception with a status and optional structured response payload.
 * The framework's error normalizer uses getStatus() and getResponse().
 */
class HttpException extends Error {
    status;
    response;
    constructor(status, message, options) {
        super(message ?? getHttpCodeErrorMessage(status));
        this.name = new.target.name;
        this.status = status;
        this.response = options?.response;
    }
    /** HTTP status code. */
    getStatus() {
        return this.status;
    }
    /**
     * Response payload to send to the client. Defaults to { message }.
     * Subclasses can pass a structured `response` object via the constructor options.
     */
    getResponse() {
        return this.response ?? { message: this.message };
    }
}
exports.HttpException = HttpException;
//# sourceMappingURL=HttpException.js.map