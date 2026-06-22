# Node Express Boilerplate

Basic Node.js API boilerplate with TypeScript, Express, `mssql`, Prisma migrations, and SQL Server running in Docker.

## Requirements

- Node.js 22+
- Docker Desktop

## Setup

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

The API runs at `http://localhost:3000`.

## Useful Commands

```bash
npm run dev              # start the API in watch mode
npm run build            # compile TypeScript
npm start                # run the compiled API
npm run typecheck        # run TypeScript checks
npm run db:up            # start SQL Server
npm run db:init          # create the app database if needed
npm run db:setup         # start SQL Server, create database, run migration
npm run db:down          # stop SQL Server
npm run prisma:studio    # open Prisma Studio
```

## Endpoints

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/technicians \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","phone":"555-0100"}'

curl http://localhost:3000/technicians
```

## Database

The SQL Server container uses the `Developer` edition image:

```yaml
image: mcr.microsoft.com/mssql/server:2022-latest
```

Prisma reads `DATABASE_URL` for migrations. The API uses the `DB_*` values through the `mssql` package. The default local values are:

```env
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
DB_NAME=appdb
DB_HOST=localhost
DB_PORT=1433
DATABASE_URL="sqlserver://localhost:1433;database=appdb;user=sa;password=YourStrong!Passw0rd;encrypt=true;trustServerCertificate=true"
```
