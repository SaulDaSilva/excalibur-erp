#!/usr/bin/env bash

set -o errexit

cd /app/backend

python manage.py collectstatic --no-input
python manage.py migrate --no-input
gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-10000}
