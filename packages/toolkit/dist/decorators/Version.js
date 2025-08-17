"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = Version;
const decorators_constants_1 = require("./decorators.constants");
/**
 * Set API version. Can be used on the controller (applies to all routes)
 * or on a method (overrides controller-level version).
 */
function Version(version) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target, propertyKey) => {
        if (propertyKey) {
            Reflect.defineMetadata(decorators_constants_1.METADATA.VERSION, version, target.constructor, propertyKey);
        }
        else {
            Reflect.defineMetadata(decorators_constants_1.METADATA.VERSION, version, target);
        }
    };
}
//# sourceMappingURL=Version.js.map