"""Email service for account verification."""

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from apps.accounts.models import User

logger = logging.getLogger(__name__)


def _send_template_email(subject: str, recipient: str, plain_message: str, html_message: str) -> None:
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send email to %s", recipient)
        raise


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

    _send_template_email(subject, user.email, plain_message, message)


def send_password_reset_email(user: User, code: str) -> None:
    """Send a 6-digit password reset code to the user's email."""
    context = {
        "user_name": user.full_name,
        "code": code,
        "frontend_url": settings.FRONTEND_URL,
    }
    subject = "Reset your LeaveDesk password"
    message = render_to_string("emails/password_reset.html", context)
    plain_message = render_to_string("emails/password_reset.txt", context)

    _send_template_email(subject, user.email, plain_message, message)
