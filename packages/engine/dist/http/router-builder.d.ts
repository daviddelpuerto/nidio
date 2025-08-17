import type { MiddlewareClass } from '@nidio/toolkit';
import { Container } from '../di/Container';
import type { HttpAdapter } from './adapters/HttpAdapter';
/**
 * Build and mount all HTTP routes found in the container.
 * Middlewares are merged in this order: global → controller → route → method.
 */
export declare function buildAndMountRoutes(adapter: HttpAdapter, container: Container, globalMiddlewares?: MiddlewareClass[]): void;
//# sourceMappingURL=router-builder.d.ts.map