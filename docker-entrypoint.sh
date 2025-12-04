#!/bin/bash
set -e


if [ "$CONTAINER_TYPE" = "master" ]; then
#    python manage.py collectstatic --noinput
#    echo "collected static"
    python manage.py migrate | tee migration_logs.txt
    echo "migrated"
    gunicorn --timeout 100 --bind 0.0.0.0:8000 CoreRoot.wsgi:application
fi

if [ "$CONTAINER_TYPE" = "c-worker" ]; then
    celery -A "CoreRoot" worker -l info -Q "test-task" --concurrency=3
fi

