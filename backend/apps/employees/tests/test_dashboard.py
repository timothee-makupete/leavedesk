"""Dashboard API tests."""

from apps.accounts.tests.test_utils import EMSAPITestCase
from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType


class DashboardAPITestCase(EMSAPITestCase):
    def setUp(self):
        self.admin = self.create_admin(email="dash@test.com", employee_id="ADM700")
        self.employee = self.create_employee(email="dashemp@test.com", employee_id="EMP800")
        LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveType.ANNUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(6),
            reason="Test",
            number_of_days=2,
            status=LeaveStatus.PENDING,
        )
        self.authenticate(self.admin)

    def test_dashboard_statistics(self):
        response = self.client.get("/api/admin/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("total_employees", response.data)
        self.assertIn("pending_requests", response.data)
        self.assertEqual(response.data["pending_requests"], 1)

    def test_employee_cannot_access_dashboard(self):
        self.authenticate(self.employee)
        response = self.client.get("/api/admin/dashboard/")
        self.assertEqual(response.status_code, 403)
