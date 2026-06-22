"""Filters for employee queries."""

import django_filters
from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole

User = get_user_model()


class EmployeeFilter(django_filters.FilterSet):
    """Filter employees by department, role, and active status."""

    department = django_filters.CharFilter(lookup_expr="icontains")
    role = django_filters.ChoiceFilter(choices=UserRole.choices)
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = User
        fields = ["department", "role", "is_active"]
