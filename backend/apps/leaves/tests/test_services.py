"""Leave request service unit tests."""

from datetime import date

from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.accounts.models import User, UserRole
from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType
from apps.leaves.validators import calculate_number_of_days, validate_no_overlap


class LeaveServiceTestCase(TestCase):
    def setUp(self):
        self.employee = User.objects.create_user(
            email="svc@test.com",
            password="SecurePass123!",
            first_name="Svc",
            last_name="Test",
            employee_id="EMP400",
        )

    def test_calculate_number_of_days(self):
        self.assertEqual(
            calculate_number_of_days(date(2026, 6, 1), date(2026, 6, 5)),
            5,
        )

    def test_overlap_with_approved_leave(self):
        LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveType.ANNUAL,
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 5),
            reason="Vacation",
            status=LeaveStatus.APPROVED,
            number_of_days=5,
        )
        with self.assertRaises(ValidationError):
            validate_no_overlap(
                employee=self.employee,
                start_date=date(2026, 7, 3),
                end_date=date(2026, 7, 10),
            )
