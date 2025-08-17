/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Node request type used by Nidio adapters. This is intentionally minimal and
 * adapter-agnostic so @nidio/engine can depend on @nidio/toolkit without cycles.
 */
export type FrameworkRequest = IncomingMessage & {
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
};

/** Node response type used by Nidio adapters. */
export type FrameworkResponse = ServerResponse;

/** HTTP methods supported by the router decorators. */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** A constructable class. */
export type Class<T = unknown> = new (...args: any[]) => T;

/**
 * Dependency token that can be registered/resolved in the DI container.
 * - Class tokens are auto-constructable when marked with @Injectable().
 * - Symbols/strings must be registered explicitly.
 */
export type DependencyToken<T = unknown> = Class<T> | symbol | string;

/** Contract of class-based middleware. */
export interface MiddlewareInterface {
  use(request: FrameworkRequest, response: FrameworkResponse, next: () => void): void | Promise<void>;
}

/** Constructor type for a class-based middleware. */
export type MiddlewareClass<T extends MiddlewareInterface = MiddlewareInterface> = new () => T;

/** Classification used by the container for quick lookups. */
export type ProviderRole = 'import' | 'repository' | 'service' | 'controller' | 'middleware';

/** Adapter interface for validation libraries (e.g., class-validator). */
export interface ValidationAdapter {
  /**
   * If true, the framework awaits validate() in the compiled middleware.
   * If false/undefined, validate() is treated as synchronous.
   */
  isAsync?: boolean;

  /** Validate and (optionally) transform plain value into an instance of dtoClass. */
  validate<T>(dtoClass: Class<T>, plain: unknown): T | Promise<T>;
}

/** Targets that can be validated on a request. */
export type ValidateTargets = {
  body?: Class<any>;
  query?: Class<any>;
  params?: Class<any>;
  headers?: Class<any>;
};

/** Value imports to register in the container before class/factory providers. */
export type ImportValue<T = unknown> = [DependencyToken<T>, T] | { token: DependencyToken<T>; value: T };

/** Provider descriptors (bootstrap only; all results are singletons). */
export type ValueProvider<T = unknown> = {
  provide: DependencyToken<T>;
  useValue: T;
  role?: ProviderRole; // defaults to 'import'
};

export type ClassProvider<T = unknown> = {
  provide: DependencyToken<T>;
  useClass: Class<T>;
  role?: ProviderRole; // defaults to 'import'
};

export type FactoryProvider<T = unknown> = {
  provide: DependencyToken<T>;
  useFactory: (...deps: any[]) => T | Promise<T>;
  inject?: DependencyToken[]; // tokens to resolve and pass to factory
  async?: boolean; // if true, factory is awaited at bootstrap
  role?: ProviderRole; // defaults to 'import'
};

export type Provider<T = unknown> = ValueProvider<T> | ClassProvider<T> | FactoryProvider<T>;
