#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

if [[ $# -lt 6 || $# -gt 7 ]]; then
  echo "Usage: $0 <username> <password> <role> <email> <first_name> <last_name> [--admin]"
  echo "Roles: ADMIN | VENTAS | BODEGA | GERENCIA"
  exit 1
fi

username="$1"
password="$2"
role="$3"
email="$4"
first_name="$5"
last_name="$6"
make_admin="${7:-}"

case "$role" in
  ADMIN|VENTAS|BODEGA|GERENCIA) ;;
  *)
    echo "Invalid role: $role"
    echo "Allowed roles: ADMIN | VENTAS | BODEGA | GERENCIA"
    exit 1
    ;;
esac

is_staff="False"
is_superuser="False"
if [[ "$make_admin" == "--admin" || "$role" == "ADMIN" ]]; then
  is_staff="True"
  is_superuser="True"
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.internal.yml}"

docker compose -f "$COMPOSE_FILE" exec -T app python manage.py shell -c "
from apps.users.models import User

username = '$username'
password = '$password'
role = '$role'
email = '$email'
first_name = '$first_name'
last_name = '$last_name'

if User.objects.filter(username=username).exists():
    raise SystemExit(f'User {username} already exists.')

user = User.objects.create_user(
    username=username,
    password=password,
    role=role,
    email=email,
    first_name=first_name,
    last_name=last_name,
)
user.is_staff = $is_staff
user.is_superuser = $is_superuser
user.save(update_fields=['is_staff', 'is_superuser'])
print(f'Created user {user.username} with role {user.role}')
"
