import type { ParamDefinition } from './decorators.types';
import type { MiddlewareClass, HttpMethod } from '../types';
/** Append a value to a class-level array metadata. */
export declare function pushClassArrayMetadata<T>(key: symbol, target: object, value: T): void;
/** Append values to a method-level array metadata. */
export declare function pushMethodArrayMetadata<T>(key: symbol, target: object, methodKey: string, ...values: T[]): void;
/** Factory for HTTP method decorators (Get/Post/...). */
export declare function createHttpMethodDecorator(method: HttpMethod): (path?: string, ...middlewares: MiddlewareClass[]) => MethodDecorator;
/** Append a ParamDefinition into the flat method-level param metadata. */
export declare function pushParamDefinition(target: object, propertyKey: string | symbol, def: ParamDefinition): void;
//# sourceMappingURL=decorators.utils.d.ts.map