import re

from django.core.cache import cache

_DURATION_MULTIPLIERS = {
    "s": 1,
    "sec": 1,
    "secs": 1,
    "second": 1,
    "seconds": 1,
    "m": 60,
    "min": 60,
    "mins": 60,
    "minute": 60,
    "minutes": 60,
    "h": 3600,
    "hr": 3600,
    "hrs": 3600,
    "hour": 3600,
    "hours": 3600,
    "d": 86400,
    "day": 86400,
    "days": 86400,
}


def parse_rate(rate: str) -> tuple[int, int]:
    try:
        count_part, period_part = rate.split("/", 1)
    except ValueError as exc:
        raise ValueError(f"Invalid rate format: {rate}") from exc

    match = re.fullmatch(r"(?:(\d+)\s*)?([a-zA-Z]+)", period_part.strip())
    if match is None:
        raise ValueError(f"Invalid rate period: {rate}")

    quantity = int(match.group(1) or "1")
    unit = match.group(2).lower()
    if unit not in _DURATION_MULTIPLIERS:
        raise ValueError(f"Unsupported rate unit: {rate}")

    return int(count_part), quantity * _DURATION_MULTIPLIERS[unit]


def get_rate_limit(rate: str) -> int:
    limit, _window_seconds = parse_rate(rate)
    return limit


def is_rate_limited(cache_key: str, rate: str) -> bool:
    current = get_cached_int(cache_key)
    return current >= get_rate_limit(rate)


def increment_rate(cache_key: str, rate: str) -> int:
    _limit, window_seconds = parse_rate(rate)
    return increment_counter(cache_key, timeout=window_seconds)


def increment_counter(cache_key: str, timeout: int) -> int:
    added = cache.add(cache_key, 1, timeout=timeout)
    if added:
        return 1

    try:
        return int(cache.incr(cache_key))
    except ValueError:
        cache.set(cache_key, 1, timeout=timeout)
        return 1


def get_cached_int(cache_key: str) -> int:
    return int(cache.get(cache_key) or 0)
