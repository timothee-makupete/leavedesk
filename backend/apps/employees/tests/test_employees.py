"""Admin employee management API tests."""

from apps.accounts.models import User
from apps.accounts.tests.test_utils import EMSAPITestCase


class AdminEmployeeAPITestCase(EMSAPITestCase):
    def setUp(self):
        self.admin = self.create_admin(email="adminemp@test.com", employee_id="ADM600")
        self.authenticate(self.admin)

    def test_admin_list_employees(self):
        self.create_employee(email="listed@test.com", employee_id="EMP700")
        response = self.client.get("/api/admin/employees/")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_admin_create_employee(self):
        response = self.client.post(
            "/api/admin/employees/",
            {
                "email": "created@test.com",
                "password": "SecurePass123!",
                "first_name": "Created",
                "last_name": "Employee",
                "employee_id": "EMP701",
                "department": "Sales",
                "role": "EMPLOYEE",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="created@test.com").exists())
