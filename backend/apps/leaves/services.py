"""Business logic for leave request workflow."""

from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.accounts.models import User
from apps.audits.services import audit_leave_approved, audit_leave_rejected
from apps.leaves.models import LeaveRequest, LeaveStatus
from apps.leaves.validators import validate_no_overlap


def approve_leave_request(
    leave_request: LeaveRequest,
    admin: User,
    admin_comment: str = "",
) -> LeaveRequest:
    """Approve a pending leave request."""
    if leave_request.employee_id == admin.id:
        raise ValidationError("You cannot approve your own leave request.")

    if leave_request.status != LeaveStatus.PENDING:
        raise ValidationError("Only pending leave requests can be approved.")

    validate_no_overlap(
        employee=leave_request.employee,
        start_date=leave_request.start_date,
        end_date=leave_request.end_date,
        exclude_pk=leave_request.pk,
    )

    leave_request.status = LeaveStatus.APPROVED
    leave_request.admin_comment = admin_comment
    leave_request.approved_by = admin
    leave_request.approved_at = timezone.now()
    leave_request.save(
        update_fields=[
            "status",
            "admin_comment",
            "approved_by",
            "approved_at",
            "updated_at",
        ]
    )
    audit_leave_approved(leave_request, admin)
    return leave_request


def reject_leave_request(
    leave_request: LeaveRequest,
    admin: User,
    admin_comment: str = "",
) -> LeaveRequest:
    """Reject a pending leave request."""
    if leave_request.employee_id == admin.id:
        raise ValidationError("You cannot reject your own leave request.")

    if leave_request.status != LeaveStatus.PENDING:
        raise ValidationError("Only pending leave requests can be rejected.")

    if not admin_comment.strip():
        raise ValidationError({"admin_comment": "A comment is required when rejecting leave."})

    leave_request.status = LeaveStatus.REJECTED
    leave_request.admin_comment = admin_comment
    leave_request.approved_by = admin
    leave_request.approved_at = timezone.now()
    leave_request.save(
        update_fields=[
            "status",
            "admin_comment",
            "approved_by",
            "approved_at",
            "updated_at",
        ]
    )
    audit_leave_rejected(leave_request, admin)
    return leave_request
