import { pushParamDefinition } from '../decorators.utils';

/** Map a request header by name (case-insensitive). */
export const Header = (headerName: string): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    pushParamDefinition(target, propertyKey!, {
      index: parameterIndex,
      type: 'header',
      name: headerName,
    });
  };
};
