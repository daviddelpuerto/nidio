# @nidio/engine

## 0.1.0-alpha.1

### Patch Changes

- 0dc4101: Fix package exports for Node resolution.

  **FastifyAdapter**: add parity with Express for built-ins
  - Security headers via `@fastify/helmet`
  - Response compression via `@fastify/compress`
  - Both are controlled by `adapterOptions.helmet` and `adapterOptions.compression`
    (`true | false | { ...options }`) and are applied at **bootstrap** (no per-request overhead).

  **Performance**
  - Fastify: avoid per-request `Object.assign` by mutating `request.raw` in place.
  - Router: switch middleware pipeline to an indexed loop on the hot path.
  - Express: pass the compiled route handler directly to avoid an extra call frame.

  No public API surface changes; adapters remain internal (types only are public). Request logging and request id behavior are unchanged.

- Updated dependencies [0dc4101]
  - @nidio/toolkit@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- d46cc48: Initial alpha of Nidio packages.

  @nidio/toolkit: public API with HTTP & param decorators, DI decorators, versioning/deprecation, TOKENS.VALIDATION_ADAPTER, and HTTP exceptions.

  @nidio/engine: runtime DI container with @Inject overrides, staged provider registry, router that compiles handlers (pre-bound methods, arg mappers, middleware pipeline), error normalization, and logger facade (Nidio dev / Pino prod). Express/Fastify adapters kept internal. CommonJS build, Node ≥20.6. Import reflect-metadata in app entry.

  @nidio/cli — Minimal scaffolding CLI (`nidio`) with `new` and `info` commands; CJS build with preserved shebang.
