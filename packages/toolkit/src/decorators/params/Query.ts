import { pushParamDefinition } from '../decorators.utils';

/** Map a query param by name. */
export const Query = (name: string): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    pushParamDefinition(target, propertyKey!, { index: parameterIndex, type: 'query', name });
  };
};
