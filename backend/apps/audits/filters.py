"""Filters for audit trail queries."""

import django_filters

from apps.audits.models import AuditAction, AuditTrail


class AuditTrailFilter(django_filters.FilterSet):
    """Filter audit logs by action, admin, and date range."""

    action = django_filters.ChoiceFilter(choices=AuditAction.choices)
    admin = django_filters.NumberFilter(field_name="admin_id")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = AuditTrail
        fields = ["action", "admin"]
