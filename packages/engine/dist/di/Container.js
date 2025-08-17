"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const toolkit_1 = require("@nidio/toolkit");
/**
 * Minimal DI container supporting:
 * - value/class/factory provider registration (via registry helpers)
 * - @Injectable() classes with constructor param metadata
 * - @Inject(token) constructor overrides
 * - role tagging for quick queries (controllers, services, ...)
 */
class Container {
    providers = new Map();
    // Roles → tokens (classes/symbols) and roles → instances
    roleTokens = new Map();
    roleInstances = new Map();
    // Inverse index: token → roles
    tokenRoles = new Map();
    /** Tag a token under a role (no instance necessary). */
    tagToken(token, role) {
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
    tagInstance(instance, role) {
        let set = this.roleInstances.get(role);
        if (!set) {
            set = new Set();
            this.roleInstances.set(role, set);
        }
        set.add(instance);
    }
    /** List tokens (class/symbol/string) by role. */
    listTokensByRole(role) {
        return Array.from(this.roleTokens.get(role) ?? []);
    }
    /** List instances by role. */
    listInstancesByRole(role) {
        return Array.from(this.roleInstances.get(role) ?? []);
    }
    /**
     * Register an existing instance under a token.
     * If `role` is provided, tag token and instance under that role.
     */
    register(token, instance, role) {
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
    resolve(token) {
        if (this.providers.has(token)) {
            return this.providers.get(token);
        }
        if (typeof token === 'function' && Reflect.getMetadata(toolkit_1.METADATA.INJECTABLE, token)) {
            const paramTypes = Reflect.getMetadata('design:paramtypes', token) || [];
            const injectOverrides = Reflect.getMetadata(toolkit_1.METADATA.INJECT_TOKENS, token) || [];
            // Build a quick lookup for overrides: paramIndex → token
            const overrideByIndex = new Map(injectOverrides);
            const paramTypesLength = paramTypes.length;
            const dependencies = new Array(paramTypesLength);
            for (let i = 0; i < paramTypesLength; i++) {
                const overrideToken = overrideByIndex.get(i);
                const depToken = (overrideToken ?? paramTypes[i]);
                dependencies[i] = this.resolve(depToken);
            }
            const instance = new token(...dependencies);
            this.providers.set(token, instance);
            const roles = this.tokenRoles.get(token);
            if (roles) {
                for (const role of roles) {
                    this.tagInstance(instance, role);
                }
            }
            return instance;
        }
        throw new Error(`No provider for token: ${String(token)}`);
    }
    has(token) {
        return this.providers.has(token);
    }
}
exports.Container = Container;
//# sourceMappingURL=Container.js.map