import type { MiddlewareClass } from '../../types';
import { METADATA } from '../decorators.constants';
import { pushMethodArrayMetadata } from '../decorators.utils';

/** Attach class-based middlewares to a route method (order-independent). */
export function UseMiddleware(...mwClasses: MiddlewareClass[]): MethodDecorator {
  return (target, propertyKey) => {
    pushMethodArrayMetadata(METADATA.METHOD_MIDDLEWARES, target, propertyKey as string, ...mwClasses);
  };
}
