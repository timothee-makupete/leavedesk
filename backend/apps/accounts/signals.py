"""Signal handlers for the accounts app."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.accounts.models import User
from apps.audits.services import audit_employee_created


@receiver(post_save, sender=User)
def audit_user_registration(sender, instance: User, created: bool, **kwargs) -> None:
    """Record self-registration of new employees in the audit trail."""
    if created and instance.is_employee:
        audit_employee_created(employee=instance, admin=None)
