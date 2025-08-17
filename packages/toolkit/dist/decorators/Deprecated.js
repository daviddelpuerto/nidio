"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deprecated = Deprecated;
/* eslint-disable @typescript-eslint/no-explicit-any */
const decorators_constants_1 = require("./decorators.constants");
/**
 * Mark a route as deprecated. We only warn once at bootstrap (non-production).
 *
 * Example:
 *   @Deprecated('Use /v2/users instead')
 */
function Deprecated(message) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(decorators_constants_1.METADATA.DEPRECATED, message ?? 'Deprecated', target.constructor, propertyKey);
    };
}
//# sourceMappingURL=Deprecated.js.map