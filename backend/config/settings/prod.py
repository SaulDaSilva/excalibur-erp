from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa


DEBUG = False

if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS must be set in production.")

if not SECRET_KEY:
    raise ImproperlyConfigured("SECRET_KEY or DJANGO_SECRET_KEY must be set in production.")

if SECRET_KEY in {"change_me_locally", "changeme", "replace-me"} or len(SECRET_KEY) < 32:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be a strong, unique value in production."
    )

SESSION_COOKIE_SECURE = env.bool("DJANGO_SESSION_COOKIE_SECURE", default=True)
CSRF_COOKIE_SECURE = env.bool("DJANGO_CSRF_COOKIE_SECURE", default=True)
SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=True)
SECURE_HSTS_SECONDS = env.int("DJANGO_SECURE_HSTS_SECONDS", default=31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=True,
)
SECURE_HSTS_PRELOAD = env.bool("DJANGO_SECURE_HSTS_PRELOAD", default=False)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = env.bool("DJANGO_USE_X_FORWARDED_HOST", default=True)

DATABASES["default"]["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60)

STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

ENABLE_ADMIN = env.bool("DJANGO_ENABLE_ADMIN", default=False)
ADMIN_URL_PATH = (
    env("DJANGO_ADMIN_URL", default="internal-admin/").strip().lstrip("/") or "internal-admin/"
)
if ADMIN_URL_PATH and not ADMIN_URL_PATH.endswith("/"):
    ADMIN_URL_PATH = f"{ADMIN_URL_PATH}/"
