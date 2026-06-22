"""Signal handlers for leave request events."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.leaves.email_service import send_leave_status_email
from apps.leaves.models import LeaveRequest, LeaveStatus


@receiver(post_save, sender=LeaveRequest)
def notify_leave_status_change(
    sender,
    instance: LeaveRequest,
    created: bool,
    **kwargs,
) -> None:
    """Send email when a leave request is approved or rejected."""
    if created:
        return

    if instance.status in (LeaveStatus.APPROVED, LeaveStatus.REJECTED):
        update_fields = kwargs.get("update_fields")
        if update_fields is None or "status" in update_fields:
            send_leave_status_email(instance)
