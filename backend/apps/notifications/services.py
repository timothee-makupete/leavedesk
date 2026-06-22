"""Notification creation helpers."""

from apps.leaves.models import LeaveRequest, LeaveStatus
from apps.notifications.models import Notification, NotificationType


def create_leave_status_notification(leave_request: LeaveRequest) -> Notification | None:
    """Create an in-app notification when a leave request is approved or rejected."""
    if leave_request.status == LeaveStatus.APPROVED:
        notification_type = NotificationType.LEAVE_APPROVED
        title = "Leave request approved"
        message = (
            f"Your {leave_request.leave_type} request from "
            f"{leave_request.start_date} to {leave_request.end_date} has been approved."
        )
    elif leave_request.status == LeaveStatus.REJECTED:
        notification_type = NotificationType.LEAVE_REJECTED
        title = "Leave request rejected"
        message = (
            f"Your {leave_request.leave_type} request from "
            f"{leave_request.start_date} to {leave_request.end_date} was rejected."
        )
        if leave_request.admin_comment:
            message += f" Reason: {leave_request.admin_comment}"
    else:
        return None

    return Notification.objects.create(
        user=leave_request.employee,
        notification_type=notification_type,
        title=title,
        message=message,
        leave_request=leave_request,
    )
