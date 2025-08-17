import { METADATA } from './decorators.constants';

/**
 * Mark a constructor parameter to be resolved by a specific DI token.
 * Use only on constructor parameters of @Injectable classes.
 *
 * Example:
 *   constructor(@Inject(TOKENS.VALIDATION_ADAPTER) private readonly validator: ValidationAdapter) {}
 */
export function Inject(token: unknown): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey !== undefined) {
      throw new Error('@Inject() is only supported on constructor parameters.');
    }

    const existing: Array<[index: number, token: unknown]> =
      Reflect.getOwnMetadata(METADATA.INJECT_TOKENS, target) || [];

    existing.push([parameterIndex, token]);
    Reflect.defineMetadata(METADATA.INJECT_TOKENS, existing, target);
  };
}
