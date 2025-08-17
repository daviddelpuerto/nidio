/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'node:crypto';
import type { FrameworkRequest, FrameworkResponse } from '../http/adapters/HttpAdapter';

/**
 * Sets a requestId for the request lifecycle.
 * - Reuses incoming X-Request-Id if present.
 * - Otherwise generates a UUID exposed on req.requestId.
 */
export function requestIdMiddleware(req: FrameworkRequest, _res: FrameworkResponse, next: (err?: any) => void): void {
  const requestIdHeader = req.headers['x-request-id'];
  const requestId =
    typeof requestIdHeader === 'string' && requestIdHeader.length > 0
      ? requestIdHeader
      : typeof randomUUID === 'function'
        ? randomUUID()
        : Math.random().toString(36).slice(2);

  req.requestId = requestId;
  next();
}
