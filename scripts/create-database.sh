#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

CONTAINER_NAME="${SQLSERVER_CONTAINER_NAME:-node-express-boilerplate-sqlserver}"
SQLSERVER_USER="${SQLSERVER_USER:-sa}"
SQLSERVER_PASSWORD="${SQLSERVER_PASSWORD:-YourStrong!Passw0rd}"
SQLSERVER_DATABASE="${SQLSERVER_DATABASE:-appdb}"

SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
if ! docker exec "$CONTAINER_NAME" test -x "$SQLCMD" >/dev/null 2>&1; then
  SQLCMD="/opt/mssql-tools/bin/sqlcmd"
fi

echo "Waiting for SQL Server to accept connections..."
for attempt in {1..60}; do
  if docker exec "$CONTAINER_NAME" "$SQLCMD" -S localhost -U "$SQLSERVER_USER" -P "$SQLSERVER_PASSWORD" -C -Q "SELECT 1" >/dev/null 2>&1; then
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    echo "SQL Server did not become ready in time." >&2
    exit 1
  fi

  sleep 2
done

echo "Creating database '$SQLSERVER_DATABASE' if needed..."
docker exec "$CONTAINER_NAME" "$SQLCMD" \
  -S localhost \
  -U "$SQLSERVER_USER" \
  -P "$SQLSERVER_PASSWORD" \
  -C \
  -Q "IF DB_ID(N'$SQLSERVER_DATABASE') IS NULL CREATE DATABASE [$SQLSERVER_DATABASE];"

echo "Database is ready."
