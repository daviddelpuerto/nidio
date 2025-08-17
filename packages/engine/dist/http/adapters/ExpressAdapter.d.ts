import http from 'http';
import type { HttpAdapter, FrameworkHandler, FrameworkHttpMethod, BuiltinAdapterOptions } from './HttpAdapter';
/** @internal Express-based HttpAdapter (not exported publicly). */
export declare class ExpressAdapter implements HttpAdapter {
    private readonly expressApp;
    private readonly httpServer;
    private readonly options;
    constructor(options?: BuiltinAdapterOptions);
    getHandler(): FrameworkHandler;
    getServer(): http.Server;
    registerRoute(method: FrameworkHttpMethod, path: string, handler: FrameworkHandler): void;
    private setupGlobalMiddlewares;
}
//# sourceMappingURL=ExpressAdapter.d.ts.map