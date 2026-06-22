"""Notification API tests."""

from apps.accounts.tests.test_utils import EMSAPITestCase
from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType
from apps.notifications.models import Notification, NotificationType


class NotificationAPITestCase(EMSAPITestCase):
    def setUp(self):
        self.employee = self.create_employee(email="notify@test.com", employee_id="EMP300")
        self.admin = self.create_admin(email="admin.notify@test.com", employee_id="ADM300")
        self.authenticate(self.employee)

    def test_leave_approval_creates_notification(self):
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveType.ANNUAL,
            start_date=self.future_date(10),
            end_date=self.future_date(12),
            reason="Vacation",
        )
        self.client.credentials()
        self.authenticate(self.admin)
        response = self.client.patch(
            f"/api/admin/leaves/{leave.id}/approve/",
            {"admin_comment": "Enjoy"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Notification.objects.filter(
                user=self.employee,
                notification_type=NotificationType.LEAVE_APPROVED,
            ).exists()
        )

    def test_list_notifications(self):
        Notification.objects.create(
            user=self.employee,
            notification_type=NotificationType.LEAVE_APPROVED,
            title="Test",
            message="Test message",
        )
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_unread_count(self):
        Notification.objects.create(
            user=self.employee,
            notification_type=NotificationType.LEAVE_REJECTED,
            title="Rejected",
            message="Rejected message",
        )
        response = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["unread_count"], 1)

    def test_mark_read(self):
        notification = Notification.objects.create(
            user=self.employee,
            notification_type=NotificationType.LEAVE_APPROVED,
            title="Approved",
            message="Approved message",
        )
        response = self.client.patch(f"/api/notifications/{notification.id}/read/")
        self.assertEqual(response.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
