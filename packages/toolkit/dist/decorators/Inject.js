"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = Inject;
const decorators_constants_1 = require("./decorators.constants");
/**
 * Mark a constructor parameter to be resolved by a specific DI token.
 * Use only on constructor parameters of @Injectable classes.
 *
 * Example:
 *   constructor(@Inject(TOKENS.VALIDATION_ADAPTER) private readonly validator: ValidationAdapter) {}
 */
function Inject(token) {
    return (target, propertyKey, parameterIndex) => {
        if (propertyKey !== undefined) {
            throw new Error('@Inject() is only supported on constructor parameters.');
        }
        const existing = Reflect.getOwnMetadata(decorators_constants_1.METADATA.INJECT_TOKENS, target) || [];
        existing.push([parameterIndex, token]);
        Reflect.defineMetadata(decorators_constants_1.METADATA.INJECT_TOKENS, existing, target);
    };
}
//# sourceMappingURL=Inject.js.map