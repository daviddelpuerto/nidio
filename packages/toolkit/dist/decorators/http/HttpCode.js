"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCode = HttpCode;
/* eslint-disable @typescript-eslint/no-explicit-any */
const decorators_constants_1 = require("../decorators.constants");
/**
 * Forces the HTTP status code for the route method.
 * If not set, the router uses a default per HTTP verb.
 */
function HttpCode(statusCode) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(decorators_constants_1.METADATA.HTTP_CODE, statusCode, target.constructor, propertyKey);
    };
}
//# sourceMappingURL=HttpCode.js.map