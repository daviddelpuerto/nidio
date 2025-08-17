"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = Validate;
/* eslint-disable @typescript-eslint/no-explicit-any */
const decorators_constants_1 = require("./decorators.constants");
/**
 * Attach DTOs to validate parts of the incoming request. Supported targets:
 * - body, query, params, headers
 *
 * Example:
 *   @Validate({ body: CreateUserDto, query: ListQueryDto })
 */
function Validate(targets) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(decorators_constants_1.METADATA.VALIDATE, targets, target.constructor, propertyKey);
    };
}
//# sourceMappingURL=Validate.js.map