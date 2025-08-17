import type { Server as HTTPServer, IncomingMessage, ServerResponse } from 'http';
/** Minimal request type passed to user handlers and middlewares. */
export type FrameworkRequest = IncomingMessage & {
    body?: unknown;
    params?: Record<string, string>;
    query?: Record<string, unknown>;
    headers: Record<string, string | string[] | undefined>;
    requestId?: string;
};
/** Minimal response type passed to user handlers and middlewares. */
export type FrameworkResponse = ServerResponse;
/**
 * A request handler that returns a payload or explicit status,
 * which the adapter will format and send to the client.
 */
export type FrameworkHandler = (req: FrameworkRequest, res: FrameworkResponse) => unknown | Promise<unknown>;
/** Supported HTTP verbs for route registration. */
export type FrameworkHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
/** Adapter interface for any HTTP engine (Express, Fastify, etc.). */
export interface HttpAdapter {
    /** Raw request listener for http.createServer(). */
    getHandler(): FrameworkHandler;
    /** If the adapter builds its own HTTPServer, expose it here. */
    getServer?(): HTTPServer;
    /** Register a route under the adapter, receiving raw Node req/res. */
    registerRoute(method: FrameworkHttpMethod, path: string, handler: FrameworkHandler): void;
    /** Optional hook to wait until internal engine has registered routes/plugins. */
    ready?(): Promise<void>;
}
/** Config for built-in adapters (evaluated at bootstrap only). */
export interface BuiltinAdapterOptions {
    /** Correlate requests via req.requestId (middleware). Default: true. */
    requestId?: boolean | {
        header?: string;
    };
    /** Emit one line per request to stdout on response finish. Default: true. */
    requestLog?: boolean | {
        sample?: number;
    };
    /** Security headers (helmet middleware). Default: true. */
    helmet?: boolean | Record<string, unknown>;
    /** Response compression (gzip/deflate/brotli). Default: true. */
    compression?: boolean | Record<string, unknown>;
}
//# sourceMappingURL=HttpAdapter.d.ts.map