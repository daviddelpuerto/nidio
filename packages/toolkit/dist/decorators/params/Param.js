"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Param = void 0;
const decorators_utils_1 = require("../decorators.utils");
/** Map a route param by name. */
const Param = (name) => {
    return (target, propertyKey, parameterIndex) => {
        (0, decorators_utils_1.pushParamDefinition)(target, propertyKey, { index: parameterIndex, type: 'param', name });
    };
};
exports.Param = Param;
//# sourceMappingURL=Param.js.map