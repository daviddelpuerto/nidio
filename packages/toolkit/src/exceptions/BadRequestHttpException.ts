import { HttpException } from './HttpException';

/** 400 Bad Request error. */
export class BadRequestHttpException extends HttpException {
  public readonly statusCode: number = 400;
  constructor(message = 'Bad Request', response?: unknown) {
    super(400, message, { response });
  }
}
