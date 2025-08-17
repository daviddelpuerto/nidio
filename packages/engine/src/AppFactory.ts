import { AppServer } from './AppServer';
import type { BuiltinAdapterOptions, HttpAdapter } from './http/adapters/HttpAdapter';
import { ExpressAdapter } from './http/adapters/ExpressAdapter';
import { FastifyAdapter } from './http/adapters/FastifyAdapter';
import { Logger } from './logger';
import { Container } from './di/Container';
import type { Class, ImportValue, MiddlewareClass, Provider } from '@nidio/toolkit';
import { buildAndMountRoutes } from './http/router-builder';
import {
  registerControllers,
  registerImports,
  registerProviders,
  registerRepositories,
  registerServices,
} from './di/di-registry';

const logger = new Logger('AppFactory');

/** Options for creating an application instance. */
export interface CreateOptions {
  /** Tokens to register prebuilt values for (e.g., config, adapters). */
  imports?: ImportValue[];
  /** Generic providers (value/class/factory). */
  providers?: Provider[];
  /** Repository classes (instantiated via DI). */
  repositories?: Class[];
  /** Service classes (instantiated via DI). */
  services?: Class[];
  /** Controller classes to mount. */
  controllers: Class[];
  /** Global middlewares applied to every route. */
  globalMiddlewares?: MiddlewareClass[];
  /** Convenience switch to use built-in adapters. */
  adapterName?: 'express' | 'fastify';
  /** Provide a custom HttpAdapter instance instead of the built-ins. */
  httpAdapter?: HttpAdapter;
  /** Options for built-in adapters. */
  adapterOptions?: BuiltinAdapterOptions;
}

/**
 * AppFactory wires DI, routes, and the HTTP adapter together.
 * All heavy reflection/metadata work happens during bootstrap only.
 */
export class AppFactory {
  public static async create(options: CreateOptions): Promise<AppServer> {
    logger.info('🚀 Starting application factory');

    const container = new Container();

    const adapterOptionsWithDefaultValues: BuiltinAdapterOptions = {
      requestId: true,
      requestLog: true,
      helmet: true,
      compression: true,
      ...(options.adapterOptions ?? {}),
    };

    let adapter: HttpAdapter;
    if (options.httpAdapter) {
      adapter = options.httpAdapter;
      logger.info('Using provided HTTP adapter');
    } else if (options.adapterName === 'fastify') {
      adapter = new FastifyAdapter(adapterOptionsWithDefaultValues);
      logger.info('Using FastifyAdapter');
    } else {
      adapter = new ExpressAdapter(adapterOptionsWithDefaultValues);
      logger.info('Using ExpressAdapter (default)');
    }

    // user-provided singletons
    registerImports(container, options.imports);

    // providers (useValue/useClass/useFactory)
    await registerProviders(container, options.providers);

    // Repositories → Services → Controllers
    registerRepositories(container, options.repositories);
    registerServices(container, options.services);
    registerControllers(container, options.controllers);

    buildAndMountRoutes(adapter, container, options.globalMiddlewares);

    if (typeof adapter.ready === 'function') {
      logger.info('Waiting for adapter to be ready...');
      await adapter.ready();
    }

    const server = await AppServer.create(adapter);
    return server;
  }
}
