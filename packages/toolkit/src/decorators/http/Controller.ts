import { METADATA } from '../decorators.constants';

/**
 * Marks a class as an HTTP controller with an optional base path.
 * If no base path is provided, routes are registered at the root.
 */
export function Controller(basePath: string = ''): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA.BASE_PATH, basePath, target);
    if (!Reflect.hasMetadata(METADATA.ROUTES, target)) {
      Reflect.defineMetadata(METADATA.ROUTES, [], target);
    }
  };
}
