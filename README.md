# Node Express Boilerplate

Basic Node.js API boilerplate with TypeScript, Express, Prisma, and SQL Server running in Docker.

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

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","name":"Ada Lovelace"}'

curl http://localhost:3000/users
```

## Database

The SQL Server container uses the `Developer` edition image:

```yaml
image: mcr.microsoft.com/mssql/server:2022-latest
```

Prisma reads the connection string from `DATABASE_URL`. The default local value is:

```env
DATABASE_URL="sqlserver://localhost:1433;database=appdb;user=sa;password=YourStrong!Passw0rd;encrypt=true;trustServerCertificate=true"
```
