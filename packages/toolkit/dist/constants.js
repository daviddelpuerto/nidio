"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKENS = void 0;
/**
 * Shared tokens used across the framework. These symbols are stable and
 * intended for application code to override/plug adapters.
 */
exports.TOKENS = {
    /**
     * Token for plugging a validation adapter (e.g., class-validator).
     * Apps provide a concrete implementation via DI:
     *
     *  registerImports(container, [
     *    [TOKENS.VALIDATION_ADAPTER, new ClassValidatorAdapter()]
     *  ])
     */
    VALIDATION_ADAPTER: Symbol.for('nidio:validation_adapter'),
};
//# sourceMappingURL=constants.js.map