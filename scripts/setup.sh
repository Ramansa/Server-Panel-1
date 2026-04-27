#!/usr/bin/env bash
set -euo pipefail

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required" >&2
  exit 1
fi

: "${DATABASE_URL:=postgres://postgres:postgres@localhost:5432/server_panel?sslmode=disable}"

createdb server_panel 2>/dev/null || true
psql "$DATABASE_URL" -f backend/migrations/001_init.sql

echo "Database ready"
