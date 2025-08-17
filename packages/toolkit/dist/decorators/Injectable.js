"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injectable = Injectable;
const decorators_constants_1 = require("./decorators.constants");
/** Mark a class as constructable by the DI container. */
function Injectable() {
    return (target) => {
        Reflect.defineMetadata(decorators_constants_1.METADATA.INJECTABLE, true, target);
    };
}
//# sourceMappingURL=Injectable.js.map