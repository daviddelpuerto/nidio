"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const decorators_utils_1 = require("../decorators.utils");
/** Map a query param by name. */
const Query = (name) => {
    return (target, propertyKey, parameterIndex) => {
        (0, decorators_utils_1.pushParamDefinition)(target, propertyKey, { index: parameterIndex, type: 'query', name });
    };
};
exports.Query = Query;
//# sourceMappingURL=Query.js.map