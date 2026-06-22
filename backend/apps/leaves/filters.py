"""Filters for leave request queries."""

import django_filters

from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType


class LeaveRequestFilter(django_filters.FilterSet):
    """Filter leave requests by type, status, and date range."""

    leave_type = django_filters.ChoiceFilter(choices=LeaveType.choices)
    status = django_filters.ChoiceFilter(choices=LeaveStatus.choices)
    start_date = django_filters.DateFilter(field_name="start_date", lookup_expr="gte")
    end_date = django_filters.DateFilter(field_name="end_date", lookup_expr="lte")
    created_after = django_filters.DateFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = LeaveRequest
        fields = ["leave_type", "status", "start_date", "end_date"]
