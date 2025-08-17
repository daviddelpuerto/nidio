import { METADATA } from './decorators.constants';

/** Mark a class as constructable by the DI container. */
export function Injectable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA.INJECTABLE, true, target);
  };
}
