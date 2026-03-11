from pathlib import Path
import os
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
AUTH_USER_MODEL = "users.User"
env = environ.Env(
    DJANGO_DEBUG=(bool, False),
)

settings_module = os.environ.get("DJANGO_SETTINGS_MODULE", "")
env_file_name = os.environ.get("DJANGO_ENV_FILE")

if env_file_name:
    env_file_path = Path(env_file_name)
    if not env_file_path.is_absolute():
        env_file_path = BASE_DIR / env_file_path
elif settings_module.endswith(".prod") and (BASE_DIR / ".env.prod").exists():
    env_file_path = BASE_DIR / ".env.prod"
else:
    env_file_path = BASE_DIR / ".env"

if env_file_path.exists():
    environ.Env.read_env(env_file_path)

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DJANGO_DEBUG")

ALLOWED_HOSTS = [h.strip() for h in env("DJANGO_ALLOWED_HOSTS", default="").split(",") if h.strip()]
ENABLE_ADMIN = env.bool("DJANGO_ENABLE_ADMIN", default=True)
ADMIN_URL_PATH = env("DJANGO_ADMIN_URL", default="admin/").strip().lstrip("/") or "admin/"
if ADMIN_URL_PATH and not ADMIN_URL_PATH.endswith("/"):
    ADMIN_URL_PATH = f"{ADMIN_URL_PATH}/"

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Local apps
    "apps.api_auth",
    "apps.dashboard",
    "apps.clientes",
    "apps.pedidos",
    "apps.inventario",
    "apps.catalogo",
    "apps.users",
    "apps.core",

    # Third-party
    "rest_framework",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be high
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
        "CONN_MAX_AGE": 0,
        "OPTIONS": {"connect_timeout": 5},
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es-ec"
TIME_ZONE = "America/Guayaquil"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# DRF: session auth + locked down by default
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "login": env("DRF_LOGIN_THROTTLE_RATE", default="5/min"),
    },
}

# CORS / CSRF for Vite dev server
CORS_ALLOWED_ORIGINS = [o.strip() for o in env("CORS_ALLOWED_ORIGINS", default="").split(",") if o.strip()]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [o.strip() for o in env("CSRF_TRUSTED_ORIGINS", default="").split(",") if o.strip()]

# Cookie posture for internal app (localhost dev ok)
SESSION_COOKIE_SAMESITE = env("DJANGO_SESSION_COOKIE_SAMESITE", default="Lax")
CSRF_COOKIE_SAMESITE = env("DJANGO_CSRF_COOKIE_SAMESITE", default="Lax")
SESSION_COOKIE_HTTPONLY = True

# The SPA reads csrftoken from the cookie to send X-CSRFToken on unsafe requests.
CSRF_COOKIE_HTTPONLY = False

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = env("DJANGO_SECURE_REFERRER_POLICY", default="strict-origin-when-cross-origin")
SECURE_CROSS_ORIGIN_OPENER_POLICY = env(
    "DJANGO_SECURE_CROSS_ORIGIN_OPENER_POLICY",
    default="same-origin",
)
