/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA } from '../decorators.constants';

/**
 * Forces the HTTP status code for the route method.
 * If not set, the router uses a default per HTTP verb.
 */
export function HttpCode(statusCode: number): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(METADATA.HTTP_CODE, statusCode, (target as any).constructor, propertyKey as string);
  };
}
