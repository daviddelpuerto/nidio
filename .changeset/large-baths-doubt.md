---
'@nidio/engine': minor
'@nidio/toolkit': minor
'@nidio/cli': minor
---

Initial alpha of Nidio toolkit and engine packages.

@nidio/toolkit: public API with HTTP & param decorators, DI decorators, versioning/deprecation, TOKENS.VALIDATION_ADAPTER, and HTTP exceptions.

@nidio/engine: runtime DI container with @Inject overrides, staged provider registry, router that compiles handlers (pre-bound methods, arg mappers, middleware pipeline), error normalization, and logger facade (Nidio dev / Pino prod). Express/Fastify adapters kept internal. CommonJS build, Node ≥20.6. Import reflect-metadata in app entry.

@nidio/cli — Minimal scaffolding CLI (`nidio`) with `new` and `info` commands; CJS build with preserved shebang.