#!/usr/bin/env bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/server_panel?sslmode=disable}"

( cd backend && go run ./cmd/server ) &
BACK_PID=$!

( cd frontend && npm install && npm run dev )

kill "$BACK_PID"
