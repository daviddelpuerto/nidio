"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppFactory = void 0;
const AppServer_1 = require("./AppServer");
const ExpressAdapter_1 = require("./http/adapters/ExpressAdapter");
const FastifyAdapter_1 = require("./http/adapters/FastifyAdapter");
const logger_1 = require("./logger");
const Container_1 = require("./di/Container");
const router_builder_1 = require("./http/router-builder");
const di_registry_1 = require("./di/di-registry");
const logger = new logger_1.Logger('AppFactory');
/**
 * AppFactory wires DI, routes, and the HTTP adapter together.
 * All heavy reflection/metadata work happens during bootstrap only.
 */
class AppFactory {
    static async create(options) {
        logger.info('🚀 Starting application factory');
        const container = new Container_1.Container();
        const adapterOptionsWithDefaultValues = {
            requestId: true,
            requestLog: true,
            helmet: true,
            compression: true,
            ...(options.adapterOptions ?? {}),
        };
        let adapter;
        if (options.httpAdapter) {
            adapter = options.httpAdapter;
            logger.info('Using provided HTTP adapter');
        }
        else if (options.adapterName === 'fastify') {
            adapter = new FastifyAdapter_1.FastifyAdapter(adapterOptionsWithDefaultValues);
            logger.info('Using FastifyAdapter');
        }
        else {
            adapter = new ExpressAdapter_1.ExpressAdapter(adapterOptionsWithDefaultValues);
            logger.info('Using ExpressAdapter (default)');
        }
        // user-provided singletons
        (0, di_registry_1.registerImports)(container, options.imports);
        // providers (useValue/useClass/useFactory)
        await (0, di_registry_1.registerProviders)(container, options.providers);
        // Repositories → Services → Controllers
        (0, di_registry_1.registerRepositories)(container, options.repositories);
        (0, di_registry_1.registerServices)(container, options.services);
        (0, di_registry_1.registerControllers)(container, options.controllers);
        (0, router_builder_1.buildAndMountRoutes)(adapter, container, options.globalMiddlewares);
        if (typeof adapter.ready === 'function') {
            logger.info('Waiting for adapter to be ready...');
            await adapter.ready();
        }
        const server = await AppServer_1.AppServer.create(adapter);
        return server;
    }
}
exports.AppFactory = AppFactory;
//# sourceMappingURL=AppFactory.js.map