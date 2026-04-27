#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:=postgres://postgres:postgres@localhost:5432/server_panel?sslmode=disable}"
psql "$DATABASE_URL" -f backend/migrations/001_init.sql
