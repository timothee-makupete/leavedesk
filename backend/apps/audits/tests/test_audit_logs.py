"""Audit log API tests."""

from apps.accounts.tests.test_utils import EMSAPITestCase
from apps.audits.models import AuditTrail


class AuditLogAPITestCase(EMSAPITestCase):
    def setUp(self):
        self.admin = self.create_admin(email="audit@test.com", employee_id="ADM800")
        AuditTrail.objects.create(
            action="Employee created",
            description="Test audit entry",
            admin=self.admin,
        )
        self.authenticate(self.admin)

    def test_admin_list_audit_logs(self):
        response = self.client.get("/api/admin/audit-logs/")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_filter_audit_logs_by_action(self):
        response = self.client.get(
            "/api/admin/audit-logs/",
            {"action": "Employee created"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.data["count"], 1)
