"""Dashboard statistics service."""

from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole
from apps.leaves.models import LeaveRequest, LeaveStatus

User = get_user_model()


def get_dashboard_statistics() -> dict[str, int]:
    """Return aggregated statistics for the admin dashboard."""
    return {
        "total_employees": User.objects.filter(
            role=UserRole.EMPLOYEE,
            is_active=True,
        ).count(),
        "total_requests": LeaveRequest.objects.count(),
        "pending_requests": LeaveRequest.objects.filter(
            status=LeaveStatus.PENDING,
        ).count(),
        "approved_requests": LeaveRequest.objects.filter(
            status=LeaveStatus.APPROVED,
        ).count(),
        "rejected_requests": LeaveRequest.objects.filter(
            status=LeaveStatus.REJECTED,
        ).count(),
    }
