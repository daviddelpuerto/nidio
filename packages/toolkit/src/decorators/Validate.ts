/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA } from './decorators.constants';
import type { ValidateTargets } from '../types';

/**
 * Attach DTOs to validate parts of the incoming request. Supported targets:
 * - body, query, params, headers
 *
 * Example:
 *   @Validate({ body: CreateUserDto, query: ListQueryDto })
 */
export function Validate(targets: ValidateTargets): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(METADATA.VALIDATE, targets, (target as any).constructor, propertyKey as string);
  };
}
