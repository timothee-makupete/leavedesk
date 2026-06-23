"""Email notification service for leave status changes."""

import logging
from threading import Thread

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string

from apps.leaves.models import LeaveRequest

logger = logging.getLogger(__name__)


def send_leave_status_email(leave_request: LeaveRequest) -> None:
    """Queue an email notification after the leave status change is committed."""
    employee = leave_request.employee
    context = {
        "employee_name": employee.full_name,
        "leave_type": leave_request.leave_type,
        "start_date": leave_request.start_date,
        "end_date": leave_request.end_date,
        "number_of_days": leave_request.number_of_days,
        "status": leave_request.status,
        "admin_comment": leave_request.admin_comment or "No comment provided.",
        "frontend_url": settings.FRONTEND_URL,
    }

    subject = f"Leave Request {leave_request.status}: {leave_request.leave_type}"
    message = render_to_string("emails/leave_status.html", context)
    plain_message = render_to_string("emails/leave_status.txt", context)

    def _deliver_email() -> None:
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[employee.email],
                html_message=message,
                fail_silently=False,
            )
        except Exception:
            logger.exception("Failed to send leave status email to %s", employee.email)

    transaction.on_commit(lambda: Thread(target=_deliver_email, daemon=True).start())
