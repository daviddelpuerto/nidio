import type { DependencyToken } from './types';
import type { ValidationAdapter } from './types';

/**
 * Shared tokens used across the framework. These symbols are stable and
 * intended for application code to override/plug adapters.
 */
export const TOKENS = {
  /**
   * Token for plugging a validation adapter (e.g., class-validator).
   * Apps provide a concrete implementation via DI:
   *
   *  registerImports(container, [
   *    [TOKENS.VALIDATION_ADAPTER, new ClassValidatorAdapter()]
   *  ])
   */
  VALIDATION_ADAPTER: Symbol.for('nidio:validation_adapter') as unknown as DependencyToken<ValidationAdapter>,
} as const;
