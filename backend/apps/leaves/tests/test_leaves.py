"""Employee leave request API tests."""

from apps.accounts.tests.test_utils import EMSAPITestCase
from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType


class LeaveRequestAPITestCase(EMSAPITestCase):
    def setUp(self):
        self.employee = self.create_employee(email="leave@test.com", employee_id="EMP500")
        self.other = self.create_employee(email="other@test.com", employee_id="EMP501")
        self.authenticate(self.employee)

    def test_create_leave_request(self):
        start = self.future_date(10)
        end = self.future_date(12)
        response = self.client.post(
            "/api/leaves/",
            {
                "leave_type": LeaveType.ANNUAL,
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "reason": "Family vacation",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["number_of_days"], 3)
        self.assertEqual(response.data["status"], LeaveStatus.PENDING)

    def test_employee_cannot_view_other_leave(self):
        leave = LeaveRequest.objects.create(
            employee=self.other,
            leave_type=LeaveType.SICK,
            start_date=self.future_date(5),
            end_date=self.future_date(6),
            reason="Sick",
            number_of_days=2,
        )
        response = self.client.get(f"/api/leaves/{leave.id}/")
        self.assertEqual(response.status_code, 404)

    def test_list_shows_only_own_leaves(self):
        LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveType.ANNUAL,
            start_date=self.future_date(1),
            end_date=self.future_date(2),
            reason="Mine",
            number_of_days=2,
        )
        LeaveRequest.objects.create(
            employee=self.other,
            leave_type=LeaveType.SICK,
            start_date=self.future_date(3),
            end_date=self.future_date(4),
            reason="Theirs",
            number_of_days=2,
        )
        response = self.client.get("/api/leaves/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
