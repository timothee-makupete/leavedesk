"""Admin leave management API tests."""

from unittest.mock import patch

from django.core import mail

from apps.accounts.tests.test_utils import EMSAPITestCase
from apps.audits.models import AuditTrail
from apps.leaves.email_service import send_leave_status_email
from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType


class AdminLeaveAPITestCase(EMSAPITestCase):
    def setUp(self):
        self.admin = self.create_admin(email="adminleave@test.com", employee_id="ADM500")
        self.employee = self.create_employee(email="empleave@test.com", employee_id="EMP600")
        self.leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveType.ANNUAL,
            start_date=self.future_date(10),
            end_date=self.future_date(12),
            reason="Holiday",
            number_of_days=3,
        )
        self.authenticate(self.admin)

    def test_admin_approve_leave(self):
        class ImmediateThread:
            def __init__(self, target, daemon=True):
                self.target = target
                self.daemon = daemon

            def start(self):
                self.target()

        with patch("apps.leaves.email_service.transaction.on_commit", side_effect=lambda callback: callback()), patch(
            "apps.leaves.email_service.Thread",
            ImmediateThread,
        ):
            response = self.client.patch(
                f"/api/admin/leaves/{self.leave.id}/approve/",
                {"admin_comment": "Approved"},
                format="json",
            )
        self.assertEqual(response.status_code, 200)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, LeaveStatus.APPROVED)
        self.assertTrue(AuditTrail.objects.filter(action="Leave approved").exists())
        self.assertEqual(len(mail.outbox), 1)

    def test_admin_reject_leave(self):
        response = self.client.patch(
            f"/api/admin/leaves/{self.leave.id}/reject/",
            {"admin_comment": "Insufficient leave balance"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, LeaveStatus.REJECTED)
        self.assertTrue(AuditTrail.objects.filter(action="Leave rejected").exists())

    def test_leave_status_email_is_deferred_until_commit(self):
        with patch("apps.leaves.email_service.transaction.on_commit", create=True) as mock_on_commit:
            send_leave_status_email(self.leave)

        mock_on_commit.assert_called_once()

    def test_admin_cannot_approve_own_leave(self):
        admin_leave = LeaveRequest.objects.create(
            employee=self.admin,
            leave_type=LeaveType.SICK,
            start_date=self.future_date(20),
            end_date=self.future_date(21),
            reason="Admin sick",
            number_of_days=2,
        )
        response = self.client.patch(
            f"/api/admin/leaves/{admin_leave.id}/approve/",
            {"admin_comment": "Approved"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
