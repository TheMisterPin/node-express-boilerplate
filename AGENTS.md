# AGENTS.md — ERP Backend Boilerplate

Condensed rules for AI agents working on projects cloned from this template. Full spec: `.cursor/rules/erp-boilerplate.mdc`.

## Architecture

- **Feature slices:** `src/features/{feature}/` with `{feature}.routes.ts`, `.controller.ts`, `.service.ts`, `.queries.ts`, `.schema.ts`, `.types.ts`
- **Shared code:** `src/shared/` (middleware, lib, types, constants)
- **Config:** `src/config/env.ts` — only place that reads `process.env`
- **Bootstrap:** `src/app.ts` (factory), `src/server.ts` (listen + shutdown)

## Non-Negotiable Rules

1. **Prisma only in `*.queries.ts`** — never in controllers, services, or middleware
2. **No business logic in controllers** — call service, use `sendSuccess()`, pass errors to `next()`
3. **No `res.json()` in controllers** — always use `sendSuccess()` / errorHandler uses `sendError()`
4. **Soft delete only** — set `deletedAt`, never `prisma.*.delete()`; always filter `deletedAt: null`
5. **Validate at route level** — `validate(schema, target)` on every route with body/params/query
6. **Authorize with middleware** — `authorize('resource', 'action')`, never hardcode role checks
7. **Response envelope** — `{ success, data, meta? }` or `{ success: false, error: { code, message, details? } }`
8. **Throw AppError** from services/queries; map Prisma errors in queries layer
9. **No `any`**, no default exports except `*.routes.ts`
10. **Path alias `@/*`** maps to `src/*`

## Auth

- Access JWT: `{ sub, role, organizationId, jti }`, 15m TTL
- Refresh token: opaque UUID in `Session` table, 7d TTL, rotated on use
- `authenticate` middleware attaches `req.user`; checks session not revoked via `jti`

## RBAC

- Roles: SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, VIEWER
- Actions: create, read, update, delete, export
- Permissions seeded in DB; `authorize()` resolves from cache

## Dependencies (allowed only)

express, @prisma/client, zod, bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit, pino, pino-pretty, uuid, dotenv

Dev: prisma, typescript, tsx, @types/*

## Extension Points

Search for `// TODO(template):` comments when adding business logic.

## Adding a Feature

Copy an existing slice (e.g. `products`), add Prisma model + migration + seed permissions, mount router in `app.ts`.
