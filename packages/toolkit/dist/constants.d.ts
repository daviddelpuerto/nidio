import type { DependencyToken } from './types';
import type { ValidationAdapter } from './types';
/**
 * Shared tokens used across the framework. These symbols are stable and
 * intended for application code to override/plug adapters.
 */
export declare const TOKENS: {
    /**
     * Token for plugging a validation adapter (e.g., class-validator).
     * Apps provide a concrete implementation via DI:
     *
     *  registerImports(container, [
     *    [TOKENS.VALIDATION_ADAPTER, new ClassValidatorAdapter()]
     *  ])
     */
    readonly VALIDATION_ADAPTER: DependencyToken<ValidationAdapter>;
};
//# sourceMappingURL=constants.d.ts.map