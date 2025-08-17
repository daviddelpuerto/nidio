import type { ProviderRole, DependencyToken } from '@nidio/toolkit';
/**
 * Minimal DI container supporting:
 * - value/class/factory provider registration (via registry helpers)
 * - @Injectable() classes with constructor param metadata
 * - @Inject(token) constructor overrides
 * - role tagging for quick queries (controllers, services, ...)
 */
export declare class Container {
    private readonly providers;
    private readonly roleTokens;
    private readonly roleInstances;
    private readonly tokenRoles;
    /** Tag a token under a role (no instance necessary). */
    tagToken(token: DependencyToken<unknown>, role: ProviderRole): void;
    /** Tag an instance under a role (does not alter token-role mapping). */
    tagInstance(instance: unknown, role: ProviderRole): void;
    /** List tokens (class/symbol/string) by role. */
    listTokensByRole(role: ProviderRole): DependencyToken<unknown>[];
    /** List instances by role. */
    listInstancesByRole<T = unknown>(role: ProviderRole): T[];
    /**
     * Register an existing instance under a token.
     * If `role` is provided, tag token and instance under that role.
     */
    register<T>(token: DependencyToken<T>, instance: T, role?: ProviderRole): void;
    /**
     * Resolve an instance for a token. If it's a class with @Injectable,
     * it is instantiated reading `design:paramtypes` and @Inject overrides.
     * After creation, the instance is tagged under the roles that the token has.
     */
    resolve<T>(token: DependencyToken<T>): T;
    has<T>(token: DependencyToken<T>): boolean;
}
//# sourceMappingURL=Container.d.ts.map