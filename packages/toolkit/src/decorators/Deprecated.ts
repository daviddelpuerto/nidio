/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA } from './decorators.constants';

/**
 * Mark a route as deprecated. We only warn once at bootstrap (non-production).
 *
 * Example:
 *   @Deprecated('Use /v2/users instead')
 */
export function Deprecated(message?: string): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      METADATA.DEPRECATED,
      message ?? 'Deprecated',
      (target as any).constructor,
      propertyKey as string,
    );
  };
}
