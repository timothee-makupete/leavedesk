"""Django admin configuration for audit trail."""

from django.contrib import admin

from apps.audits.models import AuditTrail


@admin.register(AuditTrail)
class AuditTrailAdmin(admin.ModelAdmin):
    """Read-only admin interface for audit entries."""

    list_display = ["action", "admin", "leave_request", "created_at"]
    list_filter = ["action", "created_at"]
    search_fields = ["description", "admin__email"]
    readonly_fields = ["admin", "leave_request", "action", "description", "created_at"]

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False
