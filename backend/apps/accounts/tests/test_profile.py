"""Profile API tests."""

from apps.accounts.tests.test_utils import EMSAPITestCase


class ProfileAPITestCase(EMSAPITestCase):
    def setUp(self):
        self.employee = self.create_employee(email="profile@test.com", employee_id="EMP300")
        self.authenticate(self.employee)

    def test_get_profile(self):
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], self.employee.email)

    def test_update_profile(self):
        response = self.client.patch(
            "/api/profile/",
            {"first_name": "Updated", "department": "Finance"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], "Updated")
        self.assertEqual(response.data["department"], "Finance")
