"""Authentication API tests."""

from apps.accounts.models import User
from apps.accounts.tests.test_utils import EMSAPITestCase


class AuthAPITestCase(EMSAPITestCase):
    def test_register_employee(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new.employee@test.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "first_name": "New",
                "last_name": "Employee",
                "phone_number": "+1234567890",
                "department": "HR",
                "employee_id": "EMP200",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="new.employee@test.com").exists())

    def test_register_duplicate_email(self):
        self.create_employee(email="dup@test.com", employee_id="EMP201")
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "dup@test.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "first_name": "Dup",
                "last_name": "User",
                "employee_id": "EMP202",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_login_returns_tokens(self):
        user = self.create_employee(email="login@test.com", employee_id="EMP203")
        response = self.client.post(
            "/api/auth/login/",
            {"email": user.email, "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)

    def test_logout_blacklists_refresh_token(self):
        user = self.create_employee(email="logout@test.com", employee_id="EMP204")
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": user.email, "password": "SecurePass123!"},
            format="json",
        )
        refresh = login_response.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")
        response = self.client.post("/api/auth/logout/", {"refresh": refresh}, format="json")
        self.assertEqual(response.status_code, 205)
