"""Audit trail model for tracking administrative actions."""

from django.conf import settings
from django.db import models


class AuditAction(models.TextChoices):
    LEAVE_APPROVED = "Leave approved", "Leave approved"
    LEAVE_REJECTED = "Leave rejected", "Leave rejected"
    EMPLOYEE_CREATED = "Employee created", "Employee created"
    EMPLOYEE_UPDATED = "Employee updated", "Employee updated"


class AuditTrail(models.Model):
    """Immutable log of significant system events."""

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_actions",
    )
    leave_request = models.ForeignKey(
        "leaves.LeaveRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_entries",
    )
    action = models.CharField(max_length=50, choices=AuditAction.choices)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "audit trail entry"
        verbose_name_plural = "audit trail entries"

    def __str__(self) -> str:
        return f"{self.action} - {self.created_at:%Y-%m-%d %H:%M}"
