"""Email verification code management."""

import secrets
from datetime import timedelta

from django.utils import timezone

from apps.accounts.email_service import send_verification_email
from apps.accounts.models import EmailVerificationCode, User


VERIFICATION_CODE_LENGTH = 6
VERIFICATION_CODE_TTL_MINUTES = 15


def _generate_code() -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(VERIFICATION_CODE_LENGTH))


def create_and_send_verification_code(user: User) -> EmailVerificationCode:
    """Create a new verification code and email it to the user."""
    EmailVerificationCode.objects.filter(user=user, is_used=False).update(is_used=True)
    code = _generate_code()
    verification = EmailVerificationCode.objects.create(
        user=user,
        code=code,
        expires_at=timezone.now() + timedelta(minutes=VERIFICATION_CODE_TTL_MINUTES),
    )
    send_verification_email(user, code)
    return verification


def verify_email_code(email: str, code: str) -> User:
    """Validate a verification code and mark the user's email as verified."""
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist as exc:
        raise ValueError("No account found with this email address.") from exc

    if user.email_verified:
        return user

    verification = (
        EmailVerificationCode.objects.filter(
            user=user,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now(),
        )
        .order_by("-created_at")
        .first()
    )
    if not verification:
        raise ValueError("Invalid or expired verification code.")

    verification.is_used = True
    verification.save(update_fields=["is_used"])
    user.email_verified = True
    user.save(update_fields=["email_verified"])
    return user
