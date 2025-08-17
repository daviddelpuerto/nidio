/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA } from '@nidio/toolkit';
import type { ProviderRole, DependencyToken } from '@nidio/toolkit';

/**
 * Minimal DI container supporting:
 * - value/class/factory provider registration (via registry helpers)
 * - @Injectable() classes with constructor param metadata
 * - @Inject(token) constructor overrides
 * - role tagging for quick queries (controllers, services, ...)
 */
export class Container {
  private readonly providers = new Map<DependencyToken<unknown>, unknown>();

  // Roles → tokens (classes/symbols) and roles → instances
  private readonly roleTokens = new Map<ProviderRole, Set<DependencyToken<unknown>>>();
  private readonly roleInstances = new Map<ProviderRole, Set<unknown>>();

  // Inverse index: token → roles
  private readonly tokenRoles = new Map<DependencyToken<unknown>, Set<ProviderRole>>();

  /** Tag a token under a role (no instance necessary). */
  tagToken(token: DependencyToken<unknown>, role: ProviderRole): void {
    let set = this.roleTokens.get(role);
    if (!set) {
      set = new Set();
      this.roleTokens.set(role, set);
    }
    set.add(token);

    let roles = this.tokenRoles.get(token);
    if (!roles) {
      roles = new Set();
      this.tokenRoles.set(token, roles);
    }
    roles.add(role);
  }

  /** Tag an instance under a role (does not alter token-role mapping). */
  tagInstance(instance: unknown, role: ProviderRole): void {
    let set = this.roleInstances.get(role);
    if (!set) {
      set = new Set();
      this.roleInstances.set(role, set);
    }
    set.add(instance);
  }

  /** List tokens (class/symbol/string) by role. */
  listTokensByRole(role: ProviderRole): DependencyToken<unknown>[] {
    return Array.from(this.roleTokens.get(role) ?? []);
  }

  /** List instances by role. */
  listInstancesByRole<T = unknown>(role: ProviderRole): T[] {
    return Array.from(this.roleInstances.get(role) ?? []) as T[];
  }

  /**
   * Register an existing instance under a token.
   * If `role` is provided, tag token and instance under that role.
   */
  register<T>(token: DependencyToken<T>, instance: T, role?: ProviderRole): void {
    this.providers.set(token, instance);
    if (role) {
      this.tagToken(token, role);
      this.tagInstance(instance, role);
    }
  }

  /**
   * Resolve an instance for a token. If it's a class with @Injectable,
   * it is instantiated reading `design:paramtypes` and @Inject overrides.
   * After creation, the instance is tagged under the roles that the token has.
   */
  resolve<T>(token: DependencyToken<T>): T {
    if (this.providers.has(token)) {
      return this.providers.get(token) as T;
    }

    if (typeof token === 'function' && Reflect.getMetadata(METADATA.INJECTABLE, token)) {
      const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', token) || [];
      const injectOverrides: Array<[number, DependencyToken]> =
        Reflect.getMetadata(METADATA.INJECT_TOKENS, token) || [];

      // Build a quick lookup for overrides: paramIndex → token
      const overrideByIndex = new Map<number, DependencyToken>(injectOverrides);

      const paramTypesLength = paramTypes.length;
      const dependencies = new Array(paramTypesLength);
      for (let i = 0; i < paramTypesLength; i++) {
        const overrideToken = overrideByIndex.get(i);
        const depToken = (overrideToken ?? paramTypes[i]) as DependencyToken;
        dependencies[i] = this.resolve(depToken as any);
      }

      const instance = new (token as any)(...dependencies);
      this.providers.set(token, instance);

      const roles = this.tokenRoles.get(token);
      if (roles) {
        for (const role of roles) {
          this.tagInstance(instance, role);
        }
      }
      return instance as T;
    }

    throw new Error(`No provider for token: ${String(token)}`);
  }

  has<T>(token: DependencyToken<T>): boolean {
    return this.providers.has(token);
  }
}
