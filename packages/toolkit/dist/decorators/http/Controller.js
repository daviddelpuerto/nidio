"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = Controller;
const decorators_constants_1 = require("../decorators.constants");
/**
 * Marks a class as an HTTP controller with an optional base path.
 * If no base path is provided, routes are registered at the root.
 */
function Controller(basePath = '') {
    return (target) => {
        Reflect.defineMetadata(decorators_constants_1.METADATA.BASE_PATH, basePath, target);
        if (!Reflect.hasMetadata(decorators_constants_1.METADATA.ROUTES, target)) {
            Reflect.defineMetadata(decorators_constants_1.METADATA.ROUTES, [], target);
        }
    };
}
//# sourceMappingURL=Controller.js.map