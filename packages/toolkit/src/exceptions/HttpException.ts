/** Default messages for common HTTP status codes. */
export const HTTP_STATUS_CODE_ERROR_MESSAGES: Record<number, string> = {
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

function getHttpCodeErrorMessage(status: number): string {
  return HTTP_STATUS_CODE_ERROR_MESSAGES[status] ?? 'Error';
}

/**
 * Base HTTP exception with a status and optional structured response payload.
 * The framework's error normalizer uses getStatus() and getResponse().
 */
export class HttpException extends Error {
  public readonly status: number;
  public readonly response?: unknown;

  constructor(status: number, message?: string, options?: { response?: unknown }) {
    super(message ?? getHttpCodeErrorMessage(status));
    this.name = new.target.name;
    this.status = status;
    this.response = options?.response;
  }

  /** HTTP status code. */
  getStatus(): number {
    return this.status;
  }

  /**
   * Response payload to send to the client. Defaults to { message }.
   * Subclasses can pass a structured `response` object via the constructor options.
   */
  getResponse(): unknown {
    return this.response ?? { message: this.message };
  }
}
