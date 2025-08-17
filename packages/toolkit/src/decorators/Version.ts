import { METADATA } from './decorators.constants';

/**
 * Set API version. Can be used on the controller (applies to all routes)
 * or on a method (overrides controller-level version).
 */
export function Version(version: string | number): ClassDecorator & MethodDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      Reflect.defineMetadata(METADATA.VERSION, version, target.constructor, propertyKey);
    } else {
      Reflect.defineMetadata(METADATA.VERSION, version, target);
    }
  };
}
