"""Password reset code management."""

import secrets
from datetime import timedelta

from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from apps.accounts.email_service import send_password_reset_email
from apps.accounts.models import PasswordResetCode, User

RESET_CODE_LENGTH = 6
RESET_CODE_TTL_MINUTES = 15


def _generate_code() -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(RESET_CODE_LENGTH))


def create_and_send_password_reset_code(user: User) -> PasswordResetCode:
    """Create a password reset code and email it to the user."""
    PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
    code = _generate_code()
    reset = PasswordResetCode.objects.create(
        user=user,
        code=code,
        expires_at=timezone.now() + timedelta(minutes=RESET_CODE_TTL_MINUTES),
    )
    send_password_reset_email(user, code)
    return reset


def reset_password_with_code(
    email: str,
    code: str,
    new_password: str,
) -> User:
    """Validate a reset code and set a new password."""
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist as exc:
        raise ValueError("Invalid or expired reset code.") from exc

    if not user.is_active:
        raise ValueError("This account is inactive. Contact your administrator.")

    reset = (
        PasswordResetCode.objects.filter(
            user=user,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now(),
        )
        .order_by("-created_at")
        .first()
    )
    if not reset:
        raise ValueError("Invalid or expired reset code.")

    validate_password(new_password, user=user)

    reset.is_used = True
    reset.save(update_fields=["is_used"])
    user.set_password(new_password)
    user.save(update_fields=["password"])
    return user
