import logging
import time

from django.conf import settings
from django.contrib.auth import authenticate
from django.core.cache import cache
from rest_framework import status

from apps.api_auth.throttles import get_cached_int, get_rate_limit, increment_counter, increment_rate, is_rate_limited

logger = logging.getLogger(__name__)

INVALID_CREDENTIALS_DETAIL = "Credenciales invalidas."
RATE_LIMIT_DETAIL = "Demasiados intentos. Intenta nuevamente mas tarde."


class LoginError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = INVALID_CREDENTIALS_DETAIL

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.detail
        super().__init__(self.detail)


class InvalidCredentialsError(LoginError):
    pass


class LoginRateLimitError(LoginError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    detail = RATE_LIMIT_DETAIL


def attempt_login(request, username: str, password: str):
    normalized_username = normalize_username(username)
    client_ip = get_client_ip(request)

    remaining_lockout_seconds = get_lockout_remaining_seconds(normalized_username, client_ip)
    if remaining_lockout_seconds > 0:
        logger.warning(
            "auth_login_locked_out username=%s ip=%s event=locked_out remaining_lockout_seconds=%s",
            normalized_username,
            client_ip,
            remaining_lockout_seconds,
        )
        raise LoginRateLimitError()

    throttled_scope = get_throttled_scope(normalized_username, client_ip)
    if throttled_scope is not None:
        logger.warning(
            "auth_login_throttled username=%s ip=%s event=%s",
            normalized_username,
            client_ip,
            throttled_scope,
        )
        raise LoginRateLimitError()

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        handle_failed_login(normalized_username, client_ip)
        raise InvalidCredentialsError()

    cleared_failures = clear_user_login_failures(normalized_username, client_ip)
    if cleared_failures > 0:
        logger.info(
            "auth_login_success_after_failures username=%s ip=%s event=success_after_failures cleared_failures=%s",
            normalized_username,
            client_ip,
            cleared_failures,
        )

    return user


def handle_failed_login(normalized_username: str, client_ip: str) -> None:
    ip_minute_count = increment_rate(
        get_ip_rate_key("minute", client_ip),
        settings.AUTH_IP_THROTTLE_MINUTE,
    )
    ip_hour_count = increment_rate(
        get_ip_rate_key("hour", client_ip),
        settings.AUTH_IP_THROTTLE_HOUR,
    )
    user_window_count = increment_rate(
        get_user_ip_rate_key("window", normalized_username, client_ip),
        settings.AUTH_USER_IP_THROTTLE_WINDOW,
    )
    user_day_count = increment_rate(
        get_user_ip_rate_key("day", normalized_username, client_ip),
        settings.AUTH_USER_IP_THROTTLE_DAY,
    )
    failure_count = increment_counter(
        get_user_ip_failure_key(normalized_username, client_ip),
        timeout=int(settings.AUTH_LOCKOUT_SECONDS),
    )

    if failure_count >= int(settings.AUTH_LOCKOUT_THRESHOLD):
        remaining_lockout_seconds = set_lockout(normalized_username, client_ip)
        logger.warning(
            "auth_login_locked_out username=%s ip=%s event=locked_out remaining_lockout_seconds=%s",
            normalized_username,
            client_ip,
            remaining_lockout_seconds,
        )
        raise LoginRateLimitError()

    if ip_minute_count > get_rate_limit(settings.AUTH_IP_THROTTLE_MINUTE) or ip_hour_count > get_rate_limit(settings.AUTH_IP_THROTTLE_HOUR):
        logger.warning(
            "auth_login_throttled username=%s ip=%s event=throttled_ip",
            normalized_username,
            client_ip,
        )
        raise LoginRateLimitError()

    if user_window_count > get_rate_limit(settings.AUTH_USER_IP_THROTTLE_WINDOW) or user_day_count > get_rate_limit(settings.AUTH_USER_IP_THROTTLE_DAY):
        logger.warning(
            "auth_login_throttled username=%s ip=%s event=throttled_user_ip",
            normalized_username,
            client_ip,
        )
        raise LoginRateLimitError()

    logger.warning(
        "auth_login_invalid_credentials username=%s ip=%s event=invalid_credentials",
        normalized_username,
        client_ip,
    )


def get_throttled_scope(normalized_username: str, client_ip: str) -> str | None:
    if is_rate_limited(get_ip_rate_key("minute", client_ip), settings.AUTH_IP_THROTTLE_MINUTE):
        return "throttled_ip"

    if is_rate_limited(get_ip_rate_key("hour", client_ip), settings.AUTH_IP_THROTTLE_HOUR):
        return "throttled_ip"

    if is_rate_limited(
        get_user_ip_rate_key("window", normalized_username, client_ip),
        settings.AUTH_USER_IP_THROTTLE_WINDOW,
    ):
        return "throttled_user_ip"

    if is_rate_limited(
        get_user_ip_rate_key("day", normalized_username, client_ip),
        settings.AUTH_USER_IP_THROTTLE_DAY,
    ):
        return "throttled_user_ip"

    return None


def clear_user_login_failures(normalized_username: str, client_ip: str) -> int:
    failure_key = get_user_ip_failure_key(normalized_username, client_ip)
    prior_failures = get_cached_int(failure_key)
    cache.delete_many(
        [
            failure_key,
            get_lockout_key(normalized_username, client_ip),
            get_user_ip_rate_key("window", normalized_username, client_ip),
            get_user_ip_rate_key("day", normalized_username, client_ip),
        ]
    )
    return prior_failures


def set_lockout(normalized_username: str, client_ip: str) -> int:
    lockout_seconds = int(settings.AUTH_LOCKOUT_SECONDS)
    lockout_until = int(time.time()) + lockout_seconds
    cache.set(
        get_lockout_key(normalized_username, client_ip),
        lockout_until,
        timeout=lockout_seconds,
    )
    return lockout_seconds


def get_lockout_remaining_seconds(normalized_username: str, client_ip: str) -> int:
    lockout_until = cache.get(get_lockout_key(normalized_username, client_ip))
    if lockout_until is None:
        return 0

    return max(0, int(lockout_until) - int(time.time()))


def normalize_username(username: str) -> str:
    return username.strip().lower()


def get_client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR", "unknown")


def get_ip_rate_key(window_name: str, client_ip: str) -> str:
    return f"auth:throttle:ip:{window_name}:{client_ip}"


def get_user_ip_rate_key(window_name: str, normalized_username: str, client_ip: str) -> str:
    return f"auth:throttle:userip:{window_name}:{normalized_username}:{client_ip}"


def get_user_ip_failure_key(normalized_username: str, client_ip: str) -> str:
    return f"auth:fail:userip:{normalized_username}:{client_ip}"


def get_lockout_key(normalized_username: str, client_ip: str) -> str:
    return f"auth:lock:userip:{normalized_username}:{client_ip}"
