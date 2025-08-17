"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseControllerMiddleware = UseControllerMiddleware;
const decorators_constants_1 = require("../decorators.constants");
const decorators_utils_1 = require("../decorators.utils");
/** Apply class-based middlewares to all routes of the controller. */
function UseControllerMiddleware(...middlewareClasses) {
    return (target) => {
        for (const middleware of middlewareClasses) {
            (0, decorators_utils_1.pushClassArrayMetadata)(decorators_constants_1.METADATA.CONTROLLER_MIDDLEWARES, target, middleware);
        }
    };
}
//# sourceMappingURL=UseControllerMiddleware.js.map