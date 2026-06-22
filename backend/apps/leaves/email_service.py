"""Email notification service for leave status changes."""

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from apps.leaves.models import LeaveRequest


def send_leave_status_email(leave_request: LeaveRequest) -> None:
    """Send email notification to employee when leave is approved or rejected."""
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

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[employee.email],
        html_message=message,
        fail_silently=False,
    )
