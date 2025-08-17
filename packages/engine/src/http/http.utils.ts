import { HttpException } from '@nidio/toolkit';
import type { FrameworkResponse } from './adapters/HttpAdapter';
import { Logger } from '../logger';

const logger = new Logger();

/** Build version prefix `/v{version}` or empty string. */
export function versionPrefix(version: string | number | undefined): string {
  if (version === undefined || version === null) return '';
  const v = String(version).trim();
  return v ? `/v${v}` : '';
}

/** Join URL path parts, normalizing slashes and ensuring a leading slash. */
export function joinPaths(...parts: Array<string | undefined>): string {
  let out = parts.filter(Boolean).join('');
  out = out.replace(/\/{2,}/g, '/');
  if (!out.startsWith('/')) out = `/${out}`;
  return out;
}

/**
 * Convert any thrown value into a stable HTTP error response.
 * - HttpException → { statusCode, error, message, details? }
 * - Unhandled     → 500 + { statusCode, error, message }
 */
export function normalizeError(err: unknown, requestId?: string): { status: number; body: unknown } {
  const rid = requestId ? `[${requestId}]` : '[-]';

  if (err instanceof HttpException) {
    const status = err.getStatus();
    const response = err.getResponse();

    const message =
      response && typeof response === 'object' && 'message' in (response as Record<string, unknown>)
        ? (response as Record<string, unknown>).message
        : err.message;

    const details =
      response && typeof response === 'object' && 'details' in (response as Record<string, unknown>)
        ? (response as Record<string, unknown>).details
        : undefined;

    const body: Record<string, unknown> = {
      statusCode: status,
      error: err.name ?? 'Error',
      message,
    };
    if (details !== undefined) body.details = details;

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
export function writeResponse(res: FrameworkResponse, statusCode: number, payload?: unknown): void {
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
