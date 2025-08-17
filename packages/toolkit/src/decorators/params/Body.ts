import { pushParamDefinition } from '../decorators.utils';

/** Map the entire request body to the parameter. */
export const Body = (): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    pushParamDefinition(target, propertyKey!, { index: parameterIndex, type: 'body' });
  };
};
