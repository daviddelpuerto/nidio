import { Server as HTTPServer } from 'http';
import type { HttpAdapter } from './http/adapters/HttpAdapter';
/**
 * Thin wrapper around Node's HTTP server created from a selected HttpAdapter.
 */
export declare class AppServer {
    private readonly httpServer;
    private constructor();
    /** Create a server from a provided adapter. */
    static create(httpAdapter: HttpAdapter): Promise<AppServer>;
    /** Access the underlying Node HTTP server instance. */
    getHttpServer(): HTTPServer;
    /** Start listening on a given port. */
    start(port: number): Promise<void>;
    /** Gracefully stop the server. */
    stop(): Promise<void>;
}
//# sourceMappingURL=AppServer.d.ts.map