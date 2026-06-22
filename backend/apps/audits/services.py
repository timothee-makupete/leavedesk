"""Audit trail service layer."""

from apps.accounts.models import User
from apps.audits.models import AuditAction, AuditTrail
from apps.leaves.models import LeaveRequest


def create_audit_entry(
    action: str,
    description: str,
    admin: User | None = None,
    leave_request: LeaveRequest | None = None,
) -> AuditTrail:
    """Create a new audit trail entry."""
    return AuditTrail.objects.create(
        admin=admin,
        leave_request=leave_request,
        action=action,
        description=description,
    )


def audit_leave_approved(leave_request: LeaveRequest, admin: User) -> AuditTrail:
    """Record leave approval in the audit trail."""
    return create_audit_entry(
        admin=admin,
        leave_request=leave_request,
        action=AuditAction.LEAVE_APPROVED,
        description=(
            f"Leave approved for {leave_request.employee.full_name} "
            f"({leave_request.start_date} to {leave_request.end_date}). "
            f"Comment: {leave_request.admin_comment or 'None'}"
        ),
    )


def audit_leave_rejected(leave_request: LeaveRequest, admin: User) -> AuditTrail:
    """Record leave rejection in the audit trail."""
    return create_audit_entry(
        admin=admin,
        leave_request=leave_request,
        action=AuditAction.LEAVE_REJECTED,
        description=(
            f"Leave rejected for {leave_request.employee.full_name} "
            f"({leave_request.start_date} to {leave_request.end_date}). "
            f"Comment: {leave_request.admin_comment}"
        ),
    )


def audit_employee_created(employee: User, admin: User | None = None) -> AuditTrail:
    """Record employee creation in the audit trail."""
    creator = f"by admin {admin.full_name}" if admin else "via self-registration"
    return create_audit_entry(
        admin=admin,
        action=AuditAction.EMPLOYEE_CREATED,
        description=(
            f"Employee {employee.full_name} ({employee.employee_id}) created {creator}."
        ),
    )


def audit_employee_updated(employee: User, admin: User | None = None) -> AuditTrail:
    """Record employee update in the audit trail."""
    updater = f"by admin {admin.full_name}" if admin else "by employee"
    return create_audit_entry(
        admin=admin,
        action=AuditAction.EMPLOYEE_UPDATED,
        description=(
            f"Employee {employee.full_name} ({employee.employee_id}) updated {updater}."
        ),
    )
