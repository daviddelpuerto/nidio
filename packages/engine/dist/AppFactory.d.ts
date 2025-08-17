import { AppServer } from './AppServer';
import type { BuiltinAdapterOptions, HttpAdapter } from './http/adapters/HttpAdapter';
import type { Class, ImportValue, MiddlewareClass, Provider } from '@nidio/toolkit';
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
export declare class AppFactory {
    static create(options: CreateOptions): Promise<AppServer>;
}
//# sourceMappingURL=AppFactory.d.ts.map