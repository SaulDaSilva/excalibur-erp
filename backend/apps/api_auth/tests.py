import time

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

TEST_CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "api-auth-tests",
    }
}


@override_settings(CACHES=TEST_CACHES)
class AuthApiTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)
        self.password = "test-pass-123"
        self.user = User.objects.create_user(
            username="tester",
            password=self.password,
            role=User.Role.ADMIN,
        )
        self.other_user = User.objects.create_user(
            username="another",
            password=self.password,
            role=User.Role.ADMIN,
        )
        csrf_response = self.client.get("/api/auth/csrf/", REMOTE_ADDR="203.0.113.10")
        self.csrf_token = csrf_response.cookies["csrftoken"].value

    def tearDown(self):
        cache.clear()

    def test_me_requires_authenticated_session(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_creates_session_for_me_endpoint(self):
        login_response = self._login(username=self.user.username, password=self.password)

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("sessionid", self.client.cookies)

        me_response = self.client.get("/api/auth/me/")

        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.json()["username"], self.user.username)

    @override_settings(
        AUTH_IP_THROTTLE_MINUTE="2/min",
        AUTH_IP_THROTTLE_HOUR="100/hour",
        AUTH_USER_IP_THROTTLE_WINDOW="100/15min",
        AUTH_USER_IP_THROTTLE_DAY="100/day",
        AUTH_LOCKOUT_THRESHOLD=99,
        AUTH_LOCKOUT_SECONDS=900,
    )
    def test_repeated_bad_attempts_from_same_ip_hit_ip_throttle(self):
        first_response = self._login(username=self.user.username, password="wrong-pass")
        second_response = self._login(username=self.other_user.username, password="wrong-pass")
        third_response = self._login(username=self.user.username, password="wrong-pass")

        self.assertEqual(first_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(third_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @override_settings(
        AUTH_IP_THROTTLE_MINUTE="100/min",
        AUTH_IP_THROTTLE_HOUR="100/hour",
        AUTH_USER_IP_THROTTLE_WINDOW="2/min",
        AUTH_USER_IP_THROTTLE_DAY="100/day",
        AUTH_LOCKOUT_THRESHOLD=99,
        AUTH_LOCKOUT_SECONDS=900,
    )
    def test_repeated_bad_attempts_from_same_username_and_ip_hit_user_ip_throttle(self):
        first_response = self._login(username=self.user.username, password="wrong-pass")
        second_response = self._login(username=self.user.username, password="wrong-pass")
        third_response = self._login(username=self.user.username, password="wrong-pass")

        self.assertEqual(first_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(third_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @override_settings(
        AUTH_IP_THROTTLE_MINUTE="100/min",
        AUTH_IP_THROTTLE_HOUR="100/hour",
        AUTH_USER_IP_THROTTLE_WINDOW="100/15min",
        AUTH_USER_IP_THROTTLE_DAY="100/day",
        AUTH_LOCKOUT_THRESHOLD=3,
        AUTH_LOCKOUT_SECONDS=900,
    )
    def test_lockout_activates_after_threshold(self):
        first_response = self._login(username=self.user.username, password="wrong-pass")
        second_response = self._login(username=self.user.username, password="wrong-pass")
        third_response = self._login(username=self.user.username, password="wrong-pass")

        self.assertEqual(first_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(third_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @override_settings(
        AUTH_IP_THROTTLE_MINUTE="100/min",
        AUTH_IP_THROTTLE_HOUR="100/hour",
        AUTH_USER_IP_THROTTLE_WINDOW="100/15min",
        AUTH_USER_IP_THROTTLE_DAY="100/day",
        AUTH_LOCKOUT_THRESHOLD=2,
        AUTH_LOCKOUT_SECONDS=900,
    )
    def test_successful_login_clears_user_ip_failure_count(self):
        first_response = self._login(username=self.user.username, password="wrong-pass")
        success_response = self._login(username=self.user.username, password=self.password)
        second_failure_response = self._login(username=self.user.username, password="wrong-pass")

        self.assertEqual(first_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(success_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_failure_response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        AUTH_IP_THROTTLE_MINUTE="100/min",
        AUTH_IP_THROTTLE_HOUR="100/hour",
        AUTH_USER_IP_THROTTLE_WINDOW="100/15min",
        AUTH_USER_IP_THROTTLE_DAY="100/day",
        AUTH_LOCKOUT_THRESHOLD=2,
        AUTH_LOCKOUT_SECONDS=1,
    )
    def test_lockout_expires_and_allows_login_again(self):
        first_response = self._login(username=self.user.username, password="wrong-pass")
        lockout_response = self._login(username=self.user.username, password="wrong-pass")

        self.assertEqual(first_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(lockout_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        time.sleep(1.1)

        success_response = self._login(username=self.user.username, password=self.password)

        self.assertEqual(success_response.status_code, status.HTTP_200_OK)

    def _login(self, username: str, password: str, remote_addr: str = "203.0.113.10"):
        csrf_token = self.client.cookies.get("csrftoken")
        response = self.client.post(
            "/api/auth/login/",
            {"username": username, "password": password},
            format="json",
            HTTP_X_CSRFTOKEN=(csrf_token.value if csrf_token else self.csrf_token),
            REMOTE_ADDR=remote_addr,
        )
        latest_csrf_token = self.client.cookies.get("csrftoken")
        if latest_csrf_token:
            self.csrf_token = latest_csrf_token.value
        return response
