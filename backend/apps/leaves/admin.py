"""Django admin configuration for leave requests."""

from django.contrib import admin

from apps.leaves.models import LeaveRequest


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    """Admin interface for leave requests."""

    list_display = [
        "employee",
        "leave_type",
        "start_date",
        "end_date",
        "number_of_days",
        "status",
        "created_at",
    ]
    list_filter = ["status", "leave_type", "created_at"]
    search_fields = ["employee__email", "employee__employee_id", "reason"]
    readonly_fields = [
        "number_of_days",
        "created_at",
        "updated_at",
        "approved_by",
        "approved_at",
    ]
    raw_id_fields = ["employee", "approved_by"]
