"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestHttpException = void 0;
const HttpException_1 = require("./HttpException");
/** 400 Bad Request error. */
class BadRequestHttpException extends HttpException_1.HttpException {
    statusCode = 400;
    constructor(message = 'Bad Request', response) {
        super(400, message, { response });
    }
}
exports.BadRequestHttpException = BadRequestHttpException;
//# sourceMappingURL=BadRequestHttpException.js.map