---
'@nidio/toolkit': patch
'@nidio/engine': patch
'@nidio/cli': patch
---

Fix package exports for Node resolution.

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
