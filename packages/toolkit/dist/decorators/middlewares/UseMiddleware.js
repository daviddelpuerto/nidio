"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseMiddleware = UseMiddleware;
const decorators_constants_1 = require("../decorators.constants");
const decorators_utils_1 = require("../decorators.utils");
/** Attach class-based middlewares to a route method (order-independent). */
function UseMiddleware(...mwClasses) {
    return (target, propertyKey) => {
        (0, decorators_utils_1.pushMethodArrayMetadata)(decorators_constants_1.METADATA.METHOD_MIDDLEWARES, target, propertyKey, ...mwClasses);
    };
}
//# sourceMappingURL=UseMiddleware.js.map