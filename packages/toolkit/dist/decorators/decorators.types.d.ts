import type { MiddlewareClass, HttpMethod } from '../types';
export interface RouteDefinition {
    method: HttpMethod;
    path: string;
    handlerName: string;
    middlewares: MiddlewareClass[];
}
export interface ParamDefinition {
    index: number;
    type: 'body' | 'param' | 'query' | 'header';
    name?: string;
}
//# sourceMappingURL=decorators.types.d.ts.map