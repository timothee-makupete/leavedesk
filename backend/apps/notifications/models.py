"""In-app notification models."""

from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    LEAVE_APPROVED = "leave_approved", "Leave Approved"
    LEAVE_REJECTED = "leave_rejected", "Leave Rejected"


class Notification(models.Model):
    """User-facing notification stored in the application."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    leave_request = models.ForeignKey(
        "leaves.LeaveRequest",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} — {self.user.email}"
