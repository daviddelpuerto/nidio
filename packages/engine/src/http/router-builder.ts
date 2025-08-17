/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA, TOKENS } from '@nidio/toolkit';
import type {
  MiddlewareClass,
  MiddlewareInterface,
  ParamDefinition,
  RouteDefinition,
  ValidationAdapter,
} from '@nidio/toolkit';
import { Logger } from '../logger';
import { Container } from '../di/Container';
import { joinPaths, normalizeError, versionPrefix, writeResponse } from './http.utils';
import type {
  HttpAdapter,
  FrameworkHandler,
  FrameworkHttpMethod,
  FrameworkRequest,
  FrameworkResponse,
} from './adapters/HttpAdapter';

const bootstrapLogger = new Logger('RouterBuilder');

const defaultStatusForMethod: Record<FrameworkHttpMethod, number> = {
  get: 200,
  post: 201,
  put: 200,
  patch: 200,
  delete: 204,
};

interface CompiledRoute {
  method: FrameworkHttpMethod;
  path: string;
  handler: FrameworkHandler;
}

/**
 * Build and mount all HTTP routes found in the container.
 * Middlewares are merged in this order: global → controller → route → method.
 */
export function buildAndMountRoutes(
  adapter: HttpAdapter,
  container: Container,
  globalMiddlewares?: MiddlewareClass[],
): void {
  const controllerClasses = container.listTokensByRole('controller') as Array<new () => unknown>;
  const middlewareInstanceCache = new Map<MiddlewareClass, MiddlewareInterface>();

  for (const ControllerClass of controllerClasses) {
    const compiledRoutes = compileControllerRoutes(
      ControllerClass as new () => unknown,
      container,
      globalMiddlewares,
      middlewareInstanceCache,
      bootstrapLogger,
    );

    for (const { method, path, handler } of compiledRoutes) {
      adapter.registerRoute(method, path, handler);
    }
  }
}

/** Compile all routes for a single controller into adapter-ready handlers. */
function compileControllerRoutes(
  ControllerClass: new () => unknown,
  container: Container,
  globalMiddlewares: MiddlewareClass[] | undefined,
  middlewareInstanceCache: Map<MiddlewareClass, MiddlewareInterface>,
  log: Logger,
): CompiledRoute[] {
  const controllerInstance = container.resolve(ControllerClass as any);

  const basePath: string = Reflect.getMetadata(METADATA.BASE_PATH, ControllerClass) || '';
  const routeDefinitions: RouteDefinition[] = Reflect.getMetadata(METADATA.ROUTES, ControllerClass) || [];

  log.info(`Mounting controller ${ControllerClass.name} at "${basePath}"`);

  const controllerLevelMiddlewares: MiddlewareClass[] =
    Reflect.getMetadata(METADATA.CONTROLLER_MIDDLEWARES, ControllerClass) || [];

  const compiled: CompiledRoute[] = [];

  for (const { method, path, handlerName, middlewares = [] } of routeDefinitions) {
    const fullPath = resolveFullPathAndLogDeprecation(ControllerClass, handlerName, basePath, path, method, log);
    log.info(`→ [${method.toUpperCase()}] ${fullPath}`);

    const routeStatusCode = Reflect.getMetadata(METADATA.HTTP_CODE, ControllerClass, handlerName) as number | undefined;
    const httpStatusCode = routeStatusCode ?? defaultStatusForMethod[method as FrameworkHttpMethod];

    const argumentMappers = buildArgumentMappers(ControllerClass, handlerName);
    const validationMiddleware = buildValidationAsMiddleware(container, ControllerClass, handlerName);

    const methodLevelMiddlewares: MiddlewareClass[] =
      Reflect.getMetadata(METADATA.METHOD_MIDDLEWARES, ControllerClass, handlerName) || [];

    const allMiddlewareClasses: MiddlewareClass[] = [
      ...(globalMiddlewares ?? []),
      ...controllerLevelMiddlewares,
      ...(middlewares as MiddlewareClass[]),
      ...methodLevelMiddlewares,
    ];

    const boundControllerMethod = bindControllerMethod(controllerInstance, handlerName);

    const middlewarePipeline = buildMiddlewarePipeline(
      validationMiddleware,
      allMiddlewareClasses,
      container,
      middlewareInstanceCache,
    );

    const routeHandler =
      middlewarePipeline.length === 0
        ? createDirectRouteHandler(boundControllerMethod, argumentMappers, httpStatusCode)
        : argumentMappers.length === 0
          ? createComposedRouteHandlerNoParams(boundControllerMethod, middlewarePipeline, httpStatusCode)
          : createComposedRouteHandlerWithParams(
              boundControllerMethod,
              argumentMappers,
              middlewarePipeline,
              httpStatusCode,
            );

    compiled.push({ method: method as FrameworkHttpMethod, path: fullPath, handler: routeHandler });
  }

  return compiled;
}

/** Compute final path with version prefix and emit deprecation warning (bootstrap only). */
function resolveFullPathAndLogDeprecation(
  ControllerClass: new () => unknown,
  handlerName: string,
  basePath: string,
  routePath: string,
  method: string,
  log: Logger,
): string {
  const controllerVersion = Reflect.getMetadata(METADATA.VERSION, ControllerClass) as string | number | undefined;
  const methodVersion = Reflect.getMetadata(METADATA.VERSION, ControllerClass, handlerName) as
    | string
    | number
    | undefined;

  const version = methodVersion ?? controllerVersion;
  const fullPath = joinPaths(versionPrefix(version), basePath, routePath);

  const deprecatedMessage = Reflect.getMetadata(METADATA.DEPRECATED, ControllerClass, handlerName) as
    | string
    | undefined;

  if (deprecatedMessage && process.env.NODE_ENV !== 'production') {
    log.warn(`[DEPRECATED] [${method.toUpperCase()}] ${fullPath} → ${deprecatedMessage}`);
  }

  return fullPath;
}

/** Precompute argument mappers for controller method parameters. */
function buildArgumentMappers(
  ControllerClass: new () => unknown,
  handlerName: string,
): Array<(req: FrameworkRequest) => unknown> {
  const paramsDefinitions: ParamDefinition[] =
    Reflect.getOwnMetadata(METADATA.PARAMS, ControllerClass.prototype, handlerName) || [];

  paramsDefinitions.sort((a, b) => a.index - b.index);

  const paramsDefinitionsLength = paramsDefinitions.length;
  const mappers: Array<(req: FrameworkRequest) => unknown> = new Array(paramsDefinitionsLength);

  for (let i = 0; i < paramsDefinitionsLength; i++) {
    const definition = paramsDefinitions[i];
    switch (definition.type) {
      case 'body':
        mappers[i] = (req: FrameworkRequest) => req.body;
        break;
      case 'param':
        mappers[i] = (req: FrameworkRequest) => (definition.name ? req.params?.[definition.name] : undefined);
        break;
      case 'query':
        mappers[i] = (req: FrameworkRequest) => (definition.name ? req.query?.[definition.name] : undefined);
        break;
      case 'header': {
        const headerKey = definition.name ? definition.name.toLowerCase() : undefined;
        mappers[i] = (req: FrameworkRequest) => (headerKey ? req.headers[headerKey] : undefined);
        break;
      }
      default:
        mappers[i] = () => undefined;
    }
  }

  return mappers;
}

/**
 * Build an inline middleware that performs validation at the head of the pipeline,
 * or return null if no validation should occur.
 */
function buildValidationAsMiddleware(
  container: Container,
  ControllerClass: new () => unknown,
  handlerName: string,
): MiddlewareInterface | null {
  const validationTargets = Reflect.getMetadata(METADATA.VALIDATE, ControllerClass, handlerName) as
    | { body?: unknown; query?: unknown; params?: unknown; headers?: unknown }
    | undefined;

  const validationAdapter =
    validationTargets && container.has(TOKENS.VALIDATION_ADAPTER as unknown as any)
      ? (container.resolve(TOKENS.VALIDATION_ADAPTER as any) as ValidationAdapter)
      : null;

  if (!validationTargets || !validationAdapter) return null;

  const hasBody = !!validationTargets.body;
  const hasQuery = !!validationTargets.query;
  const hasParams = !!validationTargets.params;
  const hasHeaders = !!validationTargets.headers;

  const BodyDto = validationTargets.body as any;
  const QueryDto = validationTargets.query as any;
  const ParamsDto = validationTargets.params as any;
  const HeadersDto = validationTargets.headers as any;

  const isAsyncValidationAdapter = !!validationAdapter.isAsync;

  if (isAsyncValidationAdapter) {
    // Async version (await calls), compiled once
    const validationMiddleware: MiddlewareInterface = {
      use: async (req, _res, next) => {
        if (hasBody) req.body = await validationAdapter.validate(BodyDto, req.body);
        if (hasQuery) req.query = (await validationAdapter.validate(QueryDto, req.query)) as any;
        if (hasParams) req.params = (await validationAdapter.validate(ParamsDto, req.params as any)) as any;
        if (hasHeaders) req.headers = (await validationAdapter.validate(HeadersDto, req.headers)) as any;
        next();
      },
    };
    return validationMiddleware;
  }

  // Sync version
  const validationMiddleware: MiddlewareInterface = {
    use: (req, _res, next) => {
      if (hasBody) req.body = validationAdapter.validate(BodyDto, req.body);
      if (hasQuery) req.query = validationAdapter.validate(QueryDto, req.query) as any;
      if (hasParams) req.params = validationAdapter.validate(ParamsDto, req.params) as any;
      if (hasHeaders) req.headers = validationAdapter.validate(HeadersDto, req.headers) as any;
      next();
    },
  };

  return validationMiddleware;
}

/** Resolve middlewares once (prefer DI), cache by class, and prepend optional validation. */
function buildMiddlewarePipeline(
  validationMiddleware: MiddlewareInterface | null,
  middlewareClasses: MiddlewareClass[],
  container: Container,
  cache: Map<MiddlewareClass, MiddlewareInterface>,
): MiddlewareInterface[] {
  const resolved: MiddlewareInterface[] = [];

  if (validationMiddleware) {
    resolved.push(validationMiddleware);
  }

  for (const MiddlewareConstructor of middlewareClasses) {
    const cached = cache.get(MiddlewareConstructor);
    if (cached) {
      resolved.push(cached);
      continue;
    }

    let instance: MiddlewareInterface;
    try {
      instance = container.resolve(MiddlewareConstructor as any) as MiddlewareInterface;
    } catch {
      instance = new MiddlewareConstructor();
    }

    cache.set(MiddlewareConstructor, instance);
    resolved.push(instance);
  }

  return resolved;
}

/** Bind controller method once to preserve `this` and avoid property lookups per request. */
function bindControllerMethod(controllerInstance: unknown, handlerName: string): (...args: any[]) => any {
  const method = (controllerInstance as any)[handlerName];
  return method.bind(controllerInstance) as (...args: any[]) => any;
}

/** Create a direct route handler (no validation and no middlewares). */
function createDirectRouteHandler(
  boundControllerMethod: (...args: any[]) => any,
  argumentMappers: Array<(req: FrameworkRequest) => unknown>,
  httpStatusCode: number,
): FrameworkHandler {
  return async (req, res) => {
    try {
      const argumentMappersLength = argumentMappers.length;
      const args = argumentMappersLength
        ? (() => {
            const out = new Array(argumentMappersLength);
            for (let i = 0; i < argumentMappersLength; i++) out[i] = argumentMappers[i](req);
            return out;
          })()
        : [];

      const result = args.length > 0 ? await boundControllerMethod(...args) : await boundControllerMethod();
      writeResponse(res, httpStatusCode, result);
    } catch (error) {
      handleErrorAndWriteResponse(error, req, res);
    }
  };
}

/** Create a composed route handler for pipelines with no parameter mappers. */
function createComposedRouteHandlerNoParams(
  boundControllerMethod: (...args: any[]) => any,
  middlewarePipeline: MiddlewareInterface[],
  httpStatusCode: number,
): FrameworkHandler {
  return async (req, res) => {
    try {
      const shouldProceed = await runMiddlewarePipelineSequentially(req, res, middlewarePipeline);
      if (!shouldProceed) return;
      const result = await boundControllerMethod();
      writeResponse(res, httpStatusCode, result);
    } catch (error) {
      handleErrorAndWriteResponse(error, req, res);
    }
  };
}

/** Create a composed route handler for pipelines that require parameter mapping. */
function createComposedRouteHandlerWithParams(
  boundControllerMethod: (...args: any[]) => any,
  argumentMappers: Array<(req: FrameworkRequest) => unknown>,
  middlewarePipeline: MiddlewareInterface[],
  httpStatusCode: number,
): FrameworkHandler {
  return async (req, res) => {
    try {
      const shouldProceed = await runMiddlewarePipelineSequentially(req, res, middlewarePipeline);
      if (!shouldProceed) return;

      const mappersLength = argumentMappers.length;
      const args = new Array(mappersLength);
      for (let i = 0; i < mappersLength; i++) {
        args[i] = argumentMappers[i](req);
      }

      const result = await boundControllerMethod(...args);
      writeResponse(res, httpStatusCode, result);
    } catch (error) {
      handleErrorAndWriteResponse(error, req, res);
    }
  };
}

/** Run middlewares sequentially; stop if a middleware handles the response without calling next(). */
async function runMiddlewarePipelineSequentially(
  req: FrameworkRequest,
  res: FrameworkResponse,
  middlewarePipeline: MiddlewareInterface[],
): Promise<boolean> {
  if (middlewarePipeline.length === 0) return true;

  let proceed = false;
  const next = () => (proceed = true);

  for (let i = 0, len = middlewarePipeline.length; i < len; i++) {
    proceed = false;
    const maybe = middlewarePipeline[i].use(req as any, res as any, next);
    if (maybe && typeof (maybe as Promise<void>).then === 'function') {
      await maybe;
    }
    if (!proceed) return false;
  }

  return true;
}

/** Normalize error and write response with a stable body. */
function handleErrorAndWriteResponse(error: unknown, req: FrameworkRequest, res: FrameworkResponse): void {
  const requestId = req.requestId;
  const { status, body } = normalizeError(error, requestId);
  writeResponse(res, status, body);
}
