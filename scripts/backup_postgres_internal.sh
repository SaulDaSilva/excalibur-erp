#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.internal.yml}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"

mkdir -p "$BACKUP_DIR"

timestamp="$(date +"%Y%m%d-%H%M%S")"
backup_file="$BACKUP_DIR/excalibur-internal-$timestamp.dump"

docker compose -f "$COMPOSE_FILE" exec -T db \
  sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > "$backup_file"

echo "Backup created at $backup_file"
