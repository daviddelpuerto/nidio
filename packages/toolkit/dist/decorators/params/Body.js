"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const decorators_utils_1 = require("../decorators.utils");
/** Map the entire request body to the parameter. */
const Body = () => {
    return (target, propertyKey, parameterIndex) => {
        (0, decorators_utils_1.pushParamDefinition)(target, propertyKey, { index: parameterIndex, type: 'body' });
    };
};
exports.Body = Body;
//# sourceMappingURL=Body.js.map