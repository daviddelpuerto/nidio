/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA } from './decorators.constants';
import type { RouteDefinition, ParamDefinition } from './decorators.types';
import type { MiddlewareClass, HttpMethod } from '../types';

/** Append a value to a class-level array metadata. */
export function pushClassArrayMetadata<T>(key: symbol, target: object, value: T): void {
  const list: T[] = Reflect.getMetadata(key, target) || [];
  list.push(value);
  Reflect.defineMetadata(key, list, target);
}

/** Append values to a method-level array metadata. */
export function pushMethodArrayMetadata<T>(key: symbol, target: object, methodKey: string, ...values: T[]): void {
  const list: T[] = Reflect.getOwnMetadata(key, target, methodKey) || [];
  if (values.length) list.push(...values);
  Reflect.defineMetadata(key, list, target, methodKey);
}

/** Factory for HTTP method decorators (Get/Post/...). */
export function createHttpMethodDecorator(method: HttpMethod) {
  return (path = '', ...middlewares: MiddlewareClass[]): MethodDecorator => {
    return (target, propertyKey) => {
      const handlerName = propertyKey as string;
      const controller = (target as any).constructor;
      const routes: RouteDefinition[] = Reflect.getMetadata(METADATA.ROUTES, controller) || [];
      routes.push({ method, path, handlerName, middlewares: middlewares ?? [] });
      Reflect.defineMetadata(METADATA.ROUTES, routes, controller);
    };
  };
}

/** Append a ParamDefinition into the flat method-level param metadata. */
export function pushParamDefinition(target: object, propertyKey: string | symbol, def: ParamDefinition): void {
  const key = propertyKey as string;
  const list: ParamDefinition[] = Reflect.getOwnMetadata(METADATA.PARAMS, target, key) || [];
  list.push(def);
  Reflect.defineMetadata(METADATA.PARAMS, list, target, key);
}
