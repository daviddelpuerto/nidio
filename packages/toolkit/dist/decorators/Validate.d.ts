import type { ValidateTargets } from '../types';
/**
 * Attach DTOs to validate parts of the incoming request. Supported targets:
 * - body, query, params, headers
 *
 * Example:
 *   @Validate({ body: CreateUserDto, query: ListQueryDto })
 */
export declare function Validate(targets: ValidateTargets): MethodDecorator;
//# sourceMappingURL=Validate.d.ts.map