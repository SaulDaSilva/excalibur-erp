#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

if [[ $# -lt 2 || "$2" != "--yes" ]]; then
  echo "Usage: $0 <backup-file> --yes"
  echo "This restores into the running internal database and is destructive."
  exit 1
fi

backup_file="$1"

if [[ ! -f "$backup_file" ]]; then
  echo "Backup file not found: $backup_file"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.internal.yml}"

docker compose -f "$COMPOSE_FILE" exec -T db \
  sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges' \
  < "$backup_file"

echo "Restore completed from $backup_file"
