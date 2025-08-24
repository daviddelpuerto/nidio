/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA } from '@nidio/toolkit';
import type {
  Class,
  ClassProvider,
  FactoryProvider,
  ImportValue,
  Provider,
  ProviderRole,
  ValueProvider,
  DependencyToken,
} from '@nidio/toolkit';
import { Container } from './Container';

/** Register pre-built singletons under tokens (tagged as "import"). */
export function registerImports(container: Container, imports?: ImportValue[]): void {
  if (!imports || imports.length === 0) return;
  for (const entry of imports) {
    const [token, value]: [DependencyToken, unknown] = Array.isArray(entry)
      ? (entry as [DependencyToken, unknown])
      : [entry.token, entry.value];
    container.register(token, value, 'import');
  }
}

/** True if value looks like a user-constructable class (not a built-in). */
function isConstructableClass(maybeClass: unknown): maybeClass is Class {
  return (
    typeof maybeClass === 'function' &&
    !!(maybeClass as any).prototype &&
    (maybeClass as any).prototype.constructor === maybeClass
  );
}

/** Built-ins we never treat as DI classes. */
function isOpaqueBuiltinToken(token: unknown): boolean {
  return (
    token === Object ||
    token === Function ||
    token === Array ||
    token === String ||
    token === Number ||
    token === Boolean
  );
}

/** Cache for reflected param types to avoid repeated metadata lookups. */
function getReflectedParamTypesWithCache(cache: Map<Class, Class[]>, ctor: Class): Class[] {
  const cached = cache.get(ctor);
  if (cached) return cached;
  const types = (Reflect.getMetadata('design:paramtypes', ctor) as Class[] | undefined) ?? [];
  cache.set(ctor, types);
  return types;
}

/** Read @Inject overrides as a Map<index, token>. */
function getInjectOverrideMap(ctor: Class): Map<number, DependencyToken> {
  const pairs: Array<[number, DependencyToken]> = Reflect.getMetadata(METADATA.INJECT_TOKENS, ctor) || [];
  return new Map<number, DependencyToken>(pairs);
}

/**
 * Compute the effective constructor dependency tokens:
 * - if @Inject(token) present → that token
 * - otherwise the reflected param type
 */
function computeEffectiveDependencyTokens(
  reflectedParamTypes: Class[],
  overrideByParamIndex: Map<number, DependencyToken>,
): DependencyToken[] {
  const reflectedParamTypesLength = reflectedParamTypes.length;
  const tokens = new Array<DependencyToken>(reflectedParamTypesLength);
  for (let i = 0; i < reflectedParamTypesLength; i++) {
    const overrideToken = overrideByParamIndex.get(i);
    tokens[i] = (overrideToken ?? (reflectedParamTypes[i] as unknown)) as DependencyToken;
  }
  return tokens;
}

/**
 * Decide if a provider can be constructed *now*.
 * Rules:
 * - symbol/string/builtin tokens must already be registered
 * - class tokens:
 *   - if already registered → ok
 *   - if in this group and already constructed in a previous pass → ok
 *   - if in this group but still pending → not yet
 *   - if not in this group and not registered → missing provider (not now)
 */
function canConstructProviderNow(
  container: Container,
  effectiveTokens: DependencyToken[],
  classesInThisGroup: Set<DependencyToken>,
  remainingToConstruct: Set<DependencyToken>,
): boolean {
  const effectiveTokensLength = effectiveTokens.length;
  for (let i = 0; i < effectiveTokensLength; i++) {
    const dependencyToken = effectiveTokens[i];

    // Non-class token or builtin: must be pre-registered
    if (typeof dependencyToken !== 'function' || isOpaqueBuiltinToken(dependencyToken)) {
      if (!container.has(dependencyToken as any)) return false;
      continue;
    }

    // Class-like dependency
    if (isConstructableClass(dependencyToken)) {
      if (container.has(dependencyToken)) continue;

      const inGroup = classesInThisGroup.has(dependencyToken);
      const stillPending = remainingToConstruct.has(dependencyToken);

      if (inGroup && !stillPending) continue; // constructed in a previous pass
      if (inGroup && stillPending) return false; // wait for its turn
      return false; // external class not registered
    }

    // Non-constructable function: require explicit registration
    if (!container.has(dependencyToken as any)) return false;
  }
  return true;
}

/** Resolve constructor arguments from effective tokens. */
function resolveConstructorArguments(container: Container, effectiveTokens: DependencyToken[]): unknown[] {
  const effectiveTokensLength = effectiveTokens.length;
  const args = new Array(effectiveTokensLength);
  for (let i = 0; i < effectiveTokensLength; i++) {
    const token = effectiveTokens[i];
    args[i] = container.resolve(token as any);
  }
  return args;
}

/** Human-friendly unresolved description: ClassName(dep1, dep2, ...) */
function describeUnresolved(
  ctor: Class,
  reflectedParamTypes: Class[],
  overrideByParamIndex: Map<number, DependencyToken>,
): string {
  const deps = reflectedParamTypes
    .map((Dep, idx) => {
      const override = overrideByParamIndex.get(idx);
      if (override !== undefined) return String(override);
      return typeof Dep === 'function' ? (Dep as any).name : String(Dep);
    })
    .join(', ');
  return `${(ctor as any).name}(${deps})`;
}

/**
 * Topologically instantiate and register a group of classes into the container.
 * Applies @Inject(token) constructor overrides and throws a clear error if unresolved.
 * Complexity: O(N + E)
 */
export function registerGroup(container: Container, classes: Class[] | undefined, role: ProviderRole): void {
  if (!classes || classes.length === 0) return;

  const reflectedParamTypesCache = new Map<Class, Class[]>();
  const remainingToConstruct = new Set<DependencyToken>(classes);
  const classesInThisGroup = new Set<DependencyToken>(classes);

  while (remainingToConstruct.size > 0) {
    let constructedSomethingThisPass = false;

    for (const ProviderClass of Array.from(remainingToConstruct) as Class[]) {
      const reflected = getReflectedParamTypesWithCache(reflectedParamTypesCache, ProviderClass);
      const overrides = getInjectOverrideMap(ProviderClass);
      const effectiveTokens = computeEffectiveDependencyTokens(reflected, overrides);

      if (!canConstructProviderNow(container, effectiveTokens, classesInThisGroup, remainingToConstruct)) {
        continue;
      }

      const args = resolveConstructorArguments(container, effectiveTokens);
      const instance = new (ProviderClass as any)(...args);

      container.register(ProviderClass, instance, role);
      remainingToConstruct.delete(ProviderClass);
      constructedSomethingThisPass = true;
    }

    if (!constructedSomethingThisPass) {
      const unresolved = Array.from(remainingToConstruct as Set<Class>).map((Ctor) => {
        const reflected = getReflectedParamTypesWithCache(reflectedParamTypesCache, Ctor);
        const overrides = getInjectOverrideMap(Ctor);
        return describeUnresolved(Ctor, reflected, overrides);
      });
      throw new Error(
        `Unable to resolve providers for group [${role}]. Unresolved:\n  - ${unresolved.join(
          '\n  - ',
        )}\nCheck missing providers, @Inject(token) for primitives/interfaces, or circular deps.`,
      );
    }
  }
}

/** Convenience wrappers for staged registration. */
export const registerRepositories = (c: Container, repos?: Class[]) => registerGroup(c, repos, 'repository');
export const registerServices = (c: Container, svcs?: Class[]) => registerGroup(c, svcs, 'service');
export const registerControllers = (c: Container, ctrls: Class[]) => registerGroup(c, ctrls, 'controller');

/** Helpers to narrow provider types */
function isValueProvider(p: Provider): p is ValueProvider {
  return (p as ValueProvider).useValue !== undefined;
}
function isClassProvider(p: Provider): p is ClassProvider {
  return (p as ClassProvider).useClass !== undefined;
}
function isFactoryProvider(p: Provider): p is FactoryProvider {
  return (p as FactoryProvider).useFactory !== undefined;
}

/** Single pass that classifies providers by kind to avoid repeated shape checks later. */
function classifyProviders(providers: Provider[]): {
  valueProviders: ValueProvider[];
  classProviders: ClassProvider[];
  factoryProviders: FactoryProvider[];
} {
  const valueProviders: ValueProvider[] = [];
  const classProviders: ClassProvider[] = [];
  const factoryProviders: FactoryProvider[] = [];

  for (const provider of providers) {
    if (isValueProvider(provider)) valueProviders.push(provider);
    else if (isClassProvider(provider)) classProviders.push(provider);
    else if (isFactoryProvider(provider)) factoryProviders.push(provider);
    else throw new Error('Unknown provider shape');
  }

  return { valueProviders, classProviders, factoryProviders };
}

/**
 * Register generic providers:
 * - useValue: stored directly, has no deps → can always register first.
 * - useClass: instantiated via container.resolve() (honors @Inject overrides).
 * - useFactory: can depend on both values and classes → do it last. Can be async with inject tokens.
 */
export async function registerProviders(container: Container, providers?: Provider[]): Promise<void> {
  if (!providers || providers.length === 0) return;

  // 3 different loops guarantees the common cases succeed regardless of provider order in the array
  const { valueProviders, classProviders, factoryProviders } = classifyProviders(providers);

  // 1) useValue (no dependencies)
  for (const provider of valueProviders) {
    const role: ProviderRole = provider.role ?? 'import';
    container.register(provider.provide, provider.useValue, role);
  }

  // 2) Classes (honors @Inject overrides via container.resolve)
  for (const provider of classProviders) {
    const role: ProviderRole = provider.role ?? 'import';
    try {
      const instance = container.resolve(provider.useClass as any);
      container.register(provider.provide, instance, role);
    } catch (err) {
      const className = (provider.useClass as any)?.name ?? '<anonymous>';
      throw new Error(
        `Failed to register useClass(${className}). ` +
          `Ensure its constructor dependencies are available. ` +
          `Note: with 3-phase registration, ClassProviders cannot depend on FactoryProviders ` +
          `declared in the same "providers" list. Original error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // 3) Factories (sync/async) with explicit diagnostics for missing injects
  for (const provider of factoryProviders) {
    const role: ProviderRole = provider.role ?? 'import';
    const injectTokens = provider.inject ?? [];

    // Resolve dependencies explicitly to present clearer errors than a generic resolve() throw.
    const injectTokensLength = injectTokens.length;
    const dependencies = new Array(injectTokensLength);
    for (let i = 0; i < injectTokensLength; i++) {
      const token: DependencyToken = injectTokens[i];
      if (!container.has(token as any)) {
        throw new Error(
          `Factory provider could not resolve dependency token: ${String(token)}. ` +
            `Ensure it is registered earlier (useValue/useClass) before this factory.`,
        );
      }
      dependencies[i] = container.resolve(token as any);
    }

    try {
      const value = provider.async ? await provider.useFactory(...dependencies) : provider.useFactory(...dependencies);
      container.register(provider.provide, value as unknown, role);
    } catch (err) {
      throw new Error(
        `useFactory for token ${String(provider.provide)} throw: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
