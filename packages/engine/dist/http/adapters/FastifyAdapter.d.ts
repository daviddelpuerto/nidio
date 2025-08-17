import type { Server as HTTPServer } from 'http';
import type { FrameworkHandler, FrameworkHttpMethod, HttpAdapter, BuiltinAdapterOptions } from './HttpAdapter';
/** @internal Fastify-based HttpAdapter (not exported publicly). */
export declare class FastifyAdapter implements HttpAdapter {
    private readonly fastifyInstance;
    private readonly options;
    constructor(options?: BuiltinAdapterOptions);
    registerRoute(httpMethod: FrameworkHttpMethod, fullPath: string, handlerFn: FrameworkHandler): void;
    getServer(): HTTPServer;
    getHandler(): FrameworkHandler;
    ready(): Promise<void>;
    /** Register here global plugins, hooks, CORS, etc. */
    private installGlobalPluginsAndHooks;
}
//# sourceMappingURL=FastifyAdapter.d.ts.map