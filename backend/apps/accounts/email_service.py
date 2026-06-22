"""Email service for account verification."""

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from apps.accounts.models import User


def send_verification_email(user: User, code: str) -> None:
    """Send a 6-digit verification code to the user's email."""
    context = {
        "user_name": user.full_name,
        "code": code,
        "frontend_url": settings.FRONTEND_URL,
    }
    subject = "Verify your LeaveDesk account"
    message = render_to_string("emails/verification_code.html", context)
    plain_message = render_to_string("emails/verification_code.txt", context)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=message,
        fail_silently=False,
    )
