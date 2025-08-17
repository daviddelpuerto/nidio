"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAndMountRoutes = buildAndMountRoutes;
/* eslint-disable @typescript-eslint/no-explicit-any */
const toolkit_1 = require("@nidio/toolkit");
const logger_1 = require("../logger");
const http_utils_1 = require("./http.utils");
const bootstrapLogger = new logger_1.Logger('RouterBuilder');
const defaultStatusForMethod = {
    get: 200,
    post: 201,
    put: 200,
    patch: 200,
    delete: 204,
};
/**
 * Build and mount all HTTP routes found in the container.
 * Middlewares are merged in this order: global → controller → route → method.
 */
function buildAndMountRoutes(adapter, container, globalMiddlewares) {
    const controllerClasses = container.listTokensByRole('controller');
    const middlewareInstanceCache = new Map();
    for (const ControllerClass of controllerClasses) {
        const compiledRoutes = compileControllerRoutes(ControllerClass, container, globalMiddlewares, middlewareInstanceCache, bootstrapLogger);
        for (const { method, path, handler } of compiledRoutes) {
            adapter.registerRoute(method, path, handler);
        }
    }
}
/** Compile all routes for a single controller into adapter-ready handlers. */
function compileControllerRoutes(ControllerClass, container, globalMiddlewares, middlewareInstanceCache, log) {
    const controllerInstance = container.resolve(ControllerClass);
    const basePath = Reflect.getMetadata(toolkit_1.METADATA.BASE_PATH, ControllerClass) || '';
    const routeDefinitions = Reflect.getMetadata(toolkit_1.METADATA.ROUTES, ControllerClass) || [];
    log.info(`Mounting controller ${ControllerClass.name} at "${basePath}"`);
    const controllerLevelMiddlewares = Reflect.getMetadata(toolkit_1.METADATA.CONTROLLER_MIDDLEWARES, ControllerClass) || [];
    const compiled = [];
    for (const { method, path, handlerName, middlewares = [] } of routeDefinitions) {
        const fullPath = resolveFullPathAndLogDeprecation(ControllerClass, handlerName, basePath, path, method, log);
        log.info(`→ [${method.toUpperCase()}] ${fullPath}`);
        const routeStatusCode = Reflect.getMetadata(toolkit_1.METADATA.HTTP_CODE, ControllerClass, handlerName);
        const httpStatusCode = routeStatusCode ?? defaultStatusForMethod[method];
        const argumentMappers = buildArgumentMappers(ControllerClass, handlerName);
        const validationMiddleware = buildValidationAsMiddleware(container, ControllerClass, handlerName);
        const methodLevelMiddlewares = Reflect.getMetadata(toolkit_1.METADATA.METHOD_MIDDLEWARES, ControllerClass, handlerName) || [];
        const allMiddlewareClasses = [
            ...(globalMiddlewares ?? []),
            ...controllerLevelMiddlewares,
            ...middlewares,
            ...methodLevelMiddlewares,
        ];
        const boundControllerMethod = bindControllerMethod(controllerInstance, handlerName);
        const middlewarePipeline = buildMiddlewarePipeline(validationMiddleware, allMiddlewareClasses, container, middlewareInstanceCache);
        const routeHandler = middlewarePipeline.length === 0
            ? createDirectRouteHandler(boundControllerMethod, argumentMappers, httpStatusCode)
            : argumentMappers.length === 0
                ? createComposedRouteHandlerNoParams(boundControllerMethod, middlewarePipeline, httpStatusCode)
                : createComposedRouteHandlerWithParams(boundControllerMethod, argumentMappers, middlewarePipeline, httpStatusCode);
        compiled.push({ method: method, path: fullPath, handler: routeHandler });
    }
    return compiled;
}
/** Compute final path with version prefix and emit deprecation warning (bootstrap only). */
function resolveFullPathAndLogDeprecation(ControllerClass, handlerName, basePath, routePath, method, log) {
    const controllerVersion = Reflect.getMetadata(toolkit_1.METADATA.VERSION, ControllerClass);
    const methodVersion = Reflect.getMetadata(toolkit_1.METADATA.VERSION, ControllerClass, handlerName);
    const version = methodVersion ?? controllerVersion;
    const fullPath = (0, http_utils_1.joinPaths)((0, http_utils_1.versionPrefix)(version), basePath, routePath);
    const deprecatedMessage = Reflect.getMetadata(toolkit_1.METADATA.DEPRECATED, ControllerClass, handlerName);
    if (deprecatedMessage && process.env.NODE_ENV !== 'production') {
        log.warn(`[DEPRECATED] [${method.toUpperCase()}] ${fullPath} → ${deprecatedMessage}`);
    }
    return fullPath;
}
/** Precompute argument mappers for controller method parameters. */
function buildArgumentMappers(ControllerClass, handlerName) {
    const paramsDefinitions = Reflect.getOwnMetadata(toolkit_1.METADATA.PARAMS, ControllerClass.prototype, handlerName) || [];
    paramsDefinitions.sort((a, b) => a.index - b.index);
    const paramsDefinitionsLength = paramsDefinitions.length;
    const mappers = new Array(paramsDefinitionsLength);
    for (let i = 0; i < paramsDefinitionsLength; i++) {
        const definition = paramsDefinitions[i];
        switch (definition.type) {
            case 'body':
                mappers[i] = (req) => req.body;
                break;
            case 'param':
                mappers[i] = (req) => (definition.name ? req.params?.[definition.name] : undefined);
                break;
            case 'query':
                mappers[i] = (req) => (definition.name ? req.query?.[definition.name] : undefined);
                break;
            case 'header': {
                const headerKey = definition.name ? definition.name.toLowerCase() : undefined;
                mappers[i] = (req) => (headerKey ? req.headers[headerKey] : undefined);
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
function buildValidationAsMiddleware(container, ControllerClass, handlerName) {
    const validationTargets = Reflect.getMetadata(toolkit_1.METADATA.VALIDATE, ControllerClass, handlerName);
    const validationAdapter = validationTargets && container.has(toolkit_1.TOKENS.VALIDATION_ADAPTER)
        ? container.resolve(toolkit_1.TOKENS.VALIDATION_ADAPTER)
        : null;
    if (!validationTargets || !validationAdapter)
        return null;
    const hasBody = !!validationTargets.body;
    const hasQuery = !!validationTargets.query;
    const hasParams = !!validationTargets.params;
    const hasHeaders = !!validationTargets.headers;
    const BodyDto = validationTargets.body;
    const QueryDto = validationTargets.query;
    const ParamsDto = validationTargets.params;
    const HeadersDto = validationTargets.headers;
    const isAsyncValidationAdapter = !!validationAdapter.isAsync;
    if (isAsyncValidationAdapter) {
        // Async version (await calls), compiled once
        const validationMiddleware = {
            use: async (req, _res, next) => {
                if (hasBody)
                    req.body = await validationAdapter.validate(BodyDto, req.body);
                if (hasQuery)
                    req.query = (await validationAdapter.validate(QueryDto, req.query));
                if (hasParams)
                    req.params = (await validationAdapter.validate(ParamsDto, req.params));
                if (hasHeaders)
                    req.headers = (await validationAdapter.validate(HeadersDto, req.headers));
                next();
            },
        };
        return validationMiddleware;
    }
    // Sync version
    const validationMiddleware = {
        use: (req, _res, next) => {
            if (hasBody)
                req.body = validationAdapter.validate(BodyDto, req.body);
            if (hasQuery)
                req.query = validationAdapter.validate(QueryDto, req.query);
            if (hasParams)
                req.params = validationAdapter.validate(ParamsDto, req.params);
            if (hasHeaders)
                req.headers = validationAdapter.validate(HeadersDto, req.headers);
            next();
        },
    };
    return validationMiddleware;
}
/** Resolve middlewares once (prefer DI), cache by class, and prepend optional validation. */
function buildMiddlewarePipeline(validationMiddleware, middlewareClasses, container, cache) {
    const resolved = [];
    if (validationMiddleware) {
        resolved.push(validationMiddleware);
    }
    for (const MiddlewareConstructor of middlewareClasses) {
        const cached = cache.get(MiddlewareConstructor);
        if (cached) {
            resolved.push(cached);
            continue;
        }
        let instance;
        try {
            instance = container.resolve(MiddlewareConstructor);
        }
        catch {
            instance = new MiddlewareConstructor();
        }
        cache.set(MiddlewareConstructor, instance);
        resolved.push(instance);
    }
    return resolved;
}
/** Bind controller method once to preserve `this` and avoid property lookups per request. */
function bindControllerMethod(controllerInstance, handlerName) {
    const method = controllerInstance[handlerName];
    return method.bind(controllerInstance);
}
/** Create a direct route handler (no validation and no middlewares). */
function createDirectRouteHandler(boundControllerMethod, argumentMappers, httpStatusCode) {
    return async (req, res) => {
        try {
            const argumentMappersLength = argumentMappers.length;
            const args = argumentMappersLength
                ? (() => {
                    const out = new Array(argumentMappersLength);
                    for (let i = 0; i < argumentMappersLength; i++)
                        out[i] = argumentMappers[i](req);
                    return out;
                })()
                : [];
            const result = args.length > 0 ? await boundControllerMethod(...args) : await boundControllerMethod();
            (0, http_utils_1.writeResponse)(res, httpStatusCode, result);
        }
        catch (error) {
            handleErrorAndWriteResponse(error, req, res);
        }
    };
}
/** Create a composed route handler for pipelines with no parameter mappers. */
function createComposedRouteHandlerNoParams(boundControllerMethod, middlewarePipeline, httpStatusCode) {
    return async (req, res) => {
        try {
            const shouldProceed = await runMiddlewarePipelineSequentially(req, res, middlewarePipeline);
            if (!shouldProceed)
                return;
            const result = await boundControllerMethod();
            (0, http_utils_1.writeResponse)(res, httpStatusCode, result);
        }
        catch (error) {
            handleErrorAndWriteResponse(error, req, res);
        }
    };
}
/** Create a composed route handler for pipelines that require parameter mapping. */
function createComposedRouteHandlerWithParams(boundControllerMethod, argumentMappers, middlewarePipeline, httpStatusCode) {
    return async (req, res) => {
        try {
            const shouldProceed = await runMiddlewarePipelineSequentially(req, res, middlewarePipeline);
            if (!shouldProceed)
                return;
            const mappersLength = argumentMappers.length;
            const args = new Array(mappersLength);
            for (let i = 0; i < mappersLength; i++) {
                args[i] = argumentMappers[i](req);
            }
            const result = await boundControllerMethod(...args);
            (0, http_utils_1.writeResponse)(res, httpStatusCode, result);
        }
        catch (error) {
            handleErrorAndWriteResponse(error, req, res);
        }
    };
}
/** Run middlewares sequentially; stop if a middleware handles the response without calling next(). */
async function runMiddlewarePipelineSequentially(req, res, middlewarePipeline) {
    if (middlewarePipeline.length === 0)
        return true;
    let proceed = false;
    const next = () => (proceed = true);
    for (let i = 0, len = middlewarePipeline.length; i < len; i++) {
        proceed = false;
        const maybe = middlewarePipeline[i].use(req, res, next);
        if (maybe && typeof maybe.then === 'function') {
            await maybe;
        }
        if (!proceed)
            return false;
    }
    return true;
}
/** Normalize error and write response with a stable body. */
function handleErrorAndWriteResponse(error, req, res) {
    const requestId = req.requestId;
    const { status, body } = (0, http_utils_1.normalizeError)(error, requestId);
    (0, http_utils_1.writeResponse)(res, status, body);
}
//# sourceMappingURL=router-builder.js.map