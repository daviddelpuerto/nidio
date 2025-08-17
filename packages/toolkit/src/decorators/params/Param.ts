import { pushParamDefinition } from '../decorators.utils';

/** Map a route param by name. */
export const Param = (name: string): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    pushParamDefinition(target, propertyKey!, { index: parameterIndex, type: 'param', name });
  };
};
