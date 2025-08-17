"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushClassArrayMetadata = pushClassArrayMetadata;
exports.pushMethodArrayMetadata = pushMethodArrayMetadata;
exports.createHttpMethodDecorator = createHttpMethodDecorator;
exports.pushParamDefinition = pushParamDefinition;
/* eslint-disable @typescript-eslint/no-explicit-any */
const decorators_constants_1 = require("./decorators.constants");
/** Append a value to a class-level array metadata. */
function pushClassArrayMetadata(key, target, value) {
    const list = Reflect.getMetadata(key, target) || [];
    list.push(value);
    Reflect.defineMetadata(key, list, target);
}
/** Append values to a method-level array metadata. */
function pushMethodArrayMetadata(key, target, methodKey, ...values) {
    const list = Reflect.getOwnMetadata(key, target, methodKey) || [];
    if (values.length)
        list.push(...values);
    Reflect.defineMetadata(key, list, target, methodKey);
}
/** Factory for HTTP method decorators (Get/Post/...). */
function createHttpMethodDecorator(method) {
    return (path = '', ...middlewares) => {
        return (target, propertyKey) => {
            const handlerName = propertyKey;
            const controller = target.constructor;
            const routes = Reflect.getMetadata(decorators_constants_1.METADATA.ROUTES, controller) || [];
            routes.push({ method, path, handlerName, middlewares: middlewares ?? [] });
            Reflect.defineMetadata(decorators_constants_1.METADATA.ROUTES, routes, controller);
        };
    };
}
/** Append a ParamDefinition into the flat method-level param metadata. */
function pushParamDefinition(target, propertyKey, def) {
    const key = propertyKey;
    const list = Reflect.getOwnMetadata(decorators_constants_1.METADATA.PARAMS, target, key) || [];
    list.push(def);
    Reflect.defineMetadata(decorators_constants_1.METADATA.PARAMS, list, target, key);
}
//# sourceMappingURL=decorators.utils.js.map