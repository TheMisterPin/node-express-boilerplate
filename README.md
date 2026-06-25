# ERP Backend Boilerplate

Production-grade Node.js + Express + Prisma + PostgreSQL backend template for ERP projects. Clone this repo to start a new project with authentication, RBAC, multi-tenancy, audit logging, and feature-sliced architecture already in place.

## Requirements

- Node.js 20 LTS+
- Docker Desktop (optional, for PostgreSQL)
- pnpm, npm, or yarn

## Quickstart

```bash
# 1. Clone and install
cp .env.example .env
npm install

# 2. Start PostgreSQL (Docker)
docker compose -f docker/docker-compose.yml up -d postgres

# 3. Run migrations and seed
npm run db:migrate
npm run seed

# 4. Start the API
npm run dev
```

The API runs at `http://localhost:3000`.

### Verify

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"ChangeMe123!"}'
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `3000` | HTTP port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRES` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES` | No | `7d` | Refresh token TTL |
| `BCRYPT_SALT_ROUNDS` | No | `12` | bcrypt cost factor |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `SEED_ADMIN_EMAIL` | No | `admin@demo.local` | Seed admin email |
| `SEED_ADMIN_PASSWORD` | No | `ChangeMe123!` | Seed admin password |

## Seed Data

Running `npm run seed` creates (idempotently):

- 1 demo organization (`demo-org`)
- 5 built-in roles (SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, VIEWER)
- Full RBAC permission matrix
- Admin user (credentials from env)
- 3 sample categories and 5 sample products

## Architecture

```
src/
  app.ts              Express factory (middleware + route mounts)
  server.ts           HTTP bootstrap + graceful shutdown
  config/env.ts       Zod-validated environment
  shared/             Cross-cutting libs, middleware, types, constants
  features/           Feature slices (auth, users, products, …)
prisma/
  schema.prisma       Database models
  seed.ts             Idempotent seed script
```

Each feature slice follows the same layers:

| Layer | File | Responsibility |
|-------|------|----------------|
| Routes | `{feature}.routes.ts` | Mount handlers + middleware only |
| Controller | `{feature}.controller.ts` | req/res boundary, envelope responses |
| Service | `{feature}.service.ts` | Business logic, throws AppError |
| Queries | `{feature}.queries.ts` | All Prisma calls (and only here) |
| Schema | `{feature}.schema.ts` | Zod validation schemas |
| Types | `{feature}.types.ts` | Feature-local interfaces |

## How to Add a New Feature

1. **Add a Prisma model** in `prisma/schema.prisma` with `id`, `createdAt`, `updatedAt`, `deletedAt`, `version`, and `organizationId`.
2. **Run migration:** `npm run db:migrate`
3. **Seed permissions** for the new resource in `prisma/seed.ts`.
4. **Create the feature folder** under `src/features/{name}/` with all six layer files.
5. **Mount the router** in `src/app.ts`: `app.use('/{name}', {name}Router)`.
6. **Follow existing patterns** — copy `categories` or `products` as a reference.

## Useful Commands

```bash
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm start            # Run compiled output
npm run seed         # Seed database
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio
npm run typecheck    # TypeScript check without emit
```

## Docker (full stack)

```bash
docker compose -f docker/docker-compose.yml up --build
```

## License

MIT
