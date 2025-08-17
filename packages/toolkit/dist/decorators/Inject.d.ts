/**
 * Mark a constructor parameter to be resolved by a specific DI token.
 * Use only on constructor parameters of @Injectable classes.
 *
 * Example:
 *   constructor(@Inject(TOKENS.VALIDATION_ADAPTER) private readonly validator: ValidationAdapter) {}
 */
export declare function Inject(token: unknown): ParameterDecorator;
//# sourceMappingURL=Inject.d.ts.map