"""Shared test utilities."""

from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import User, UserRole


class EMSAPITestCase(APITestCase):
    """Base API test case with user factory helpers."""

    def create_employee(
        self,
        email: str = "employee@test.com",
        password: str = "SecurePass123!",
        **kwargs,
    ) -> User:
        defaults = {
            "first_name": "Test",
            "last_name": "Employee",
            "employee_id": kwargs.pop("employee_id", "EMP100"),
            "department": "Engineering",
            "email_verified": True,
        }
        defaults.update(kwargs)
        return User.objects.create_user(email=email, password=password, **defaults)

    def create_admin(
        self,
        email: str = "admin@test.com",
        password: str = "SecurePass123!",
        **kwargs,
    ) -> User:
        defaults = {
            "first_name": "Test",
            "last_name": "Admin",
            "employee_id": kwargs.pop("employee_id", "ADM100"),
            "role": UserRole.ADMIN,
            "is_staff": True,
            "email_verified": True,
        }
        defaults.update(kwargs)
        return User.objects.create_user(email=email, password=password, **defaults)

    def authenticate(self, user: User, password: str = "SecurePass123!") -> str:
        response = self.client.post(
            "/api/auth/login/",
            {"email": user.email, "password": password},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return token

    def future_date(self, days: int = 7):
        return timezone.localdate() + timedelta(days=days)
