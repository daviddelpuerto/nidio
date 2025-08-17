/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FrameworkRequest, FrameworkResponse } from '../http/adapters/HttpAdapter';
import { Logger } from '../logger';

const logger = new Logger();

function nowNs(): bigint {
  return process.hrtime.bigint();
}
function toMs(deltaNs: bigint): number {
  return Number(deltaNs) / 1e6;
}

/**
 * Minimal access log:
 * - one line on response finish
 * - stdout only, no files
 * - enable via adapterOptions.requestLog = true
 */
export function requestLogMiddleware(req: FrameworkRequest, res: FrameworkResponse, next: (err?: any) => void): void {
  const start = nowNs();

  const method = (req.method ?? '-').toUpperCase();
  const url = req.url ?? '-';
  const remote = (req.socket && req.socket.remoteAddress) || '-';
  const rid = req.requestId ? `[${req.requestId}] ` : '';

  res.on('finish', () => {
    const ms = toMs(nowNs() - start).toFixed(3);
    const length = res.getHeader('content-length') ?? '-';
    const status = res.statusCode;
    logger.http(`${rid}[${method}] [${url}] [${remote}] [${status}] [${length}] [${ms} ms]`);
  });

  next();
}
