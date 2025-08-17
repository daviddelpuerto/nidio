"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const decorators_utils_1 = require("../decorators.utils");
/** Map a request header by name (case-insensitive). */
const Header = (headerName) => {
    return (target, propertyKey, parameterIndex) => {
        (0, decorators_utils_1.pushParamDefinition)(target, propertyKey, {
            index: parameterIndex,
            type: 'header',
            name: headerName,
        });
    };
};
exports.Header = Header;
//# sourceMappingURL=Header.js.map