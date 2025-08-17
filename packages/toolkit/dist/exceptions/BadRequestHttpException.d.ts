import { HttpException } from './HttpException';
/** 400 Bad Request error. */
export declare class BadRequestHttpException extends HttpException {
    readonly statusCode: number;
    constructor(message?: string, response?: unknown);
}
//# sourceMappingURL=BadRequestHttpException.d.ts.map