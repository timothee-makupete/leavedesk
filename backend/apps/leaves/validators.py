"""Validation helpers for leave requests."""

from datetime import date

from django.apps import apps
from django.core.exceptions import ValidationError


def calculate_number_of_days(start_date: date, end_date: date) -> int:
    """Calculate inclusive number of leave days."""
    return (end_date - start_date).days + 1


def validate_no_overlap(
    employee,
    start_date: date,
    end_date: date,
    exclude_pk: int | None = None,
) -> None:
    """Ensure no overlap with existing approved leave for the same employee."""
    LeaveRequest = apps.get_model("leaves", "LeaveRequest")

    overlapping = LeaveRequest.objects.filter(
        employee=employee,
        status="Approved",
        start_date__lte=end_date,
        end_date__gte=start_date,
    )
    if exclude_pk:
        overlapping = overlapping.exclude(pk=exclude_pk)

    if overlapping.exists():
        raise ValidationError(
            "This leave period overlaps with an existing approved leave request."
        )


def validate_leave_dates(start_date: date, end_date: date) -> None:
    """Validate leave date range."""
    if start_date > end_date:
        raise ValidationError({"end_date": "End date cannot be before start date."})

    from django.utils import timezone

    today = timezone.localdate()
    if start_date < today:
        raise ValidationError({"start_date": "Start date cannot be in the past."})
