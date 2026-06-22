"""Leave request model."""

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.leaves.validators import calculate_number_of_days


class LeaveType(models.TextChoices):
    ANNUAL = "Annual Leave", "Annual Leave"
    SICK = "Sick Leave", "Sick Leave"
    MATERNITY = "Maternity Leave", "Maternity Leave"
    PATERNITY = "Paternity Leave", "Paternity Leave"
    COMPASSIONATE = "Compassionate Leave", "Compassionate Leave"
    OTHER = "Other", "Other"


class LeaveStatus(models.TextChoices):
    PENDING = "Pending", "Pending"
    APPROVED = "Approved", "Approved"
    REJECTED = "Rejected", "Rejected"


class LeaveRequest(models.Model):
    """Employee leave request with approval workflow."""

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leave_requests",
    )
    leave_type = models.CharField(max_length=50, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    number_of_days = models.PositiveIntegerField(editable=False)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=LeaveStatus.choices,
        default=LeaveStatus.PENDING,
    )
    admin_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_leaves",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "leave request"
        verbose_name_plural = "leave requests"

    def __str__(self) -> str:
        return f"{self.employee.email} - {self.leave_type} ({self.status})"

    def clean(self) -> None:
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError({"end_date": "End date cannot be before start date."})
            self.number_of_days = calculate_number_of_days(self.start_date, self.end_date)

    def save(self, *args, **kwargs) -> None:
        if self.start_date and self.end_date:
            self.number_of_days = calculate_number_of_days(self.start_date, self.end_date)
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def is_pending(self) -> bool:
        return self.status == LeaveStatus.PENDING

    @property
    def is_editable(self) -> bool:
        return self.status == LeaveStatus.PENDING
