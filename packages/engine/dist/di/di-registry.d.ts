import type { Class, ImportValue, Provider, ProviderRole } from '@nidio/toolkit';
import { Container } from './Container';
/** Register pre-built singletons under tokens (tagged as "import"). */
export declare function registerImports(container: Container, imports?: ImportValue[]): void;
/**
 * Topologically instantiate and register a group of classes into the container.
 * Applies @Inject(token) constructor overrides and throws a clear error if unresolved.
 * Complexity: O(N + E)
 */
export declare function registerGroup(container: Container, classes: Class[] | undefined, role: ProviderRole): void;
/** Convenience wrappers for staged registration. */
export declare const registerRepositories: (c: Container, repos?: Class[]) => void;
export declare const registerServices: (c: Container, svcs?: Class[]) => void;
export declare const registerControllers: (c: Container, ctrls: Class[]) => void;
/**
 * Register generic providers:
 * - useValue: stored directly, has no deps → can always register first.
 * - useClass: instantiated via container.resolve() (honors @Inject overrides).
 * - useFactory: can depend on both values and classes → do it last. Can be async with inject tokens.
 */
export declare function registerProviders(container: Container, providers?: Provider[]): Promise<void>;
//# sourceMappingURL=di-registry.d.ts.map