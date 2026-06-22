"""Views for audit log access."""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdmin
from apps.audits.filters import AuditTrailFilter
from apps.audits.models import AuditTrail
from apps.audits.serializers import AuditTrailSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["Admin - Audit Logs"],
        description="List audit log entries with pagination and filtering.",
    ),
)
class AuditTrailViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Admin-only read access to the system audit trail."""

    serializer_class = AuditTrailSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_class = AuditTrailFilter
    search_fields = ["description", "action"]
    ordering_fields = ["created_at", "action"]

    queryset = AuditTrail.objects.select_related(
        "admin",
        "leave_request",
        "leave_request__employee",
    ).all()
