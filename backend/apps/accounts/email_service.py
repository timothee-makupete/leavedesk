"""Email service for account verification."""

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from apps.accounts.models import User

logger = logging.getLogger(__name__)


def _send_template_email(
    subject: str,
    recipient: str,
    plain_message: str,
    html_message: str,
) -> None:
    """
    Send an email and log all important steps.
    """

    logger.info("=" * 60)
    logger.info("EMAIL SEND STARTED")
    logger.info("Recipient: %s", recipient)
    logger.info("Subject: %s", subject)
    logger.info("Email Backend: %s", settings.EMAIL_BACKEND)
    logger.info("Email Host: %s", settings.EMAIL_HOST)
    logger.info("Email Port: %s", settings.EMAIL_PORT)
    logger.info("Email User: %s", settings.EMAIL_HOST_USER)
    logger.info("Default From Email: %s", settings.DEFAULT_FROM_EMAIL)

    try:
        sent_count = send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info("SMTP send_mail() returned: %s", sent_count)

        if sent_count == 1:
            logger.info("EMAIL SENT SUCCESSFULLY TO %s", recipient)
        else:
            logger.warning(
                "send_mail returned %s instead of 1 for %s",
                sent_count,
                recipient,
            )

    except Exception as exc:
        logger.exception(
            "FAILED TO SEND EMAIL TO %s. ERROR: %s",
            recipient,
            str(exc),
        )
        raise

    logger.info("EMAIL SEND FINISHED")
    logger.info("=" * 60)


def send_verification_email(user: User, code: str) -> None:
    """
    Send a verification code email.
    """

    logger.info(
        "Preparing verification email for user=%s email=%s",
        user.full_name,
        user.email,
    )

    context = {
        "user_name": user.full_name,
        "code": code,
        "frontend_url": settings.FRONTEND_URL,
    }

    subject = "Verify your LeaveDesk account"

    html_message = render_to_string(
        "emails/verification_code.html",
        context,
    )

    plain_message = render_to_string(
        "emails/verification_code.txt",
        context,
    )

    _send_template_email(
        subject=subject,
        recipient=user.email,
        plain_message=plain_message,
        html_message=html_message,
    )


def send_password_reset_email(user: User, code: str) -> None:
    """
    Send a password reset code email.
    """

    logger.info(
        "Preparing password reset email for user=%s email=%s",
        user.full_name,
        user.email,
    )

    context = {
        "user_name": user.full_name,
        "code": code,
        "frontend_url": settings.FRONTEND_URL,
    }

    subject = "Reset your LeaveDesk password"

    html_message = render_to_string(
        "emails/password_reset.html",
        context,
    )

    plain_message = render_to_string(
        "emails/password_reset.txt",
        context,
    )

    _send_template_email(
        subject=subject,
        recipient=user.email,
        plain_message=plain_message,
        html_message=html_message,
    )