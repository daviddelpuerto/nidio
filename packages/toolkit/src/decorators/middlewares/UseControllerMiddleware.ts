import { METADATA } from '../decorators.constants';
import type { MiddlewareClass } from '../../types';
import { pushClassArrayMetadata } from '../decorators.utils';

/** Apply class-based middlewares to all routes of the controller. */
export function UseControllerMiddleware(...middlewareClasses: MiddlewareClass[]): ClassDecorator {
  return (target) => {
    for (const middleware of middlewareClasses) {
      pushClassArrayMetadata(METADATA.CONTROLLER_MIDDLEWARES, target, middleware);
    }
  };
}
