"""Admin views for leave approval workflow."""

from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import OpenApiExample, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin
from apps.leaves.filters import LeaveRequestFilter
from apps.leaves.models import LeaveRequest
from apps.leaves.serializers import AdminLeaveActionSerializer, AdminLeaveRequestSerializer
from apps.leaves.services import approve_leave_request, reject_leave_request


@extend_schema_view(
    list=extend_schema(tags=["Admin - Leaves"], description="List all leave requests."),
    retrieve=extend_schema(tags=["Admin - Leaves"], description="Retrieve a leave request."),
)
class AdminLeaveViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Admin endpoints for reviewing and actioning leave requests."""

    serializer_class = AdminLeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_class = LeaveRequestFilter
    search_fields = ["reason", "leave_type", "employee__email", "employee__employee_id"]
    ordering_fields = ["created_at", "start_date", "status"]

    queryset = LeaveRequest.objects.select_related(
        "employee",
        "approved_by",
    ).all()

    @extend_schema(
        tags=["Admin - Leaves"],
        request=AdminLeaveActionSerializer,
        responses={200: AdminLeaveRequestSerializer},
        examples=[
            OpenApiExample(
                "Approve Leave",
                value={"admin_comment": "Approved"},
                request_only=True,
            ),
        ],
    )
    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request: Request, pk: int | None = None) -> Response:
        leave_request = self.get_object()
        serializer = AdminLeaveActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            leave_request = approve_leave_request(
                leave_request=leave_request,
                admin=request.user,
                admin_comment=serializer.validated_data.get("admin_comment", ""),
            )
        except DjangoValidationError as exc:
            message = exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            return Response(message, status=status.HTTP_400_BAD_REQUEST)

        return Response(AdminLeaveRequestSerializer(leave_request).data)

    @extend_schema(
        tags=["Admin - Leaves"],
        request=AdminLeaveActionSerializer,
        responses={200: AdminLeaveRequestSerializer},
        examples=[
            OpenApiExample(
                "Reject Leave",
                value={"admin_comment": "Insufficient leave balance"},
                request_only=True,
            ),
        ],
    )
    @action(detail=True, methods=["patch"], url_path="reject")
    def reject(self, request: Request, pk: int | None = None) -> Response:
        leave_request = self.get_object()
        serializer = AdminLeaveActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            leave_request = reject_leave_request(
                leave_request=leave_request,
                admin=request.user,
                admin_comment=serializer.validated_data.get("admin_comment", ""),
            )
        except DjangoValidationError as exc:
            message = exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            return Response(message, status=status.HTTP_400_BAD_REQUEST)

        return Response(AdminLeaveRequestSerializer(leave_request).data)
