"""Views for employee leave request management."""

from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.accounts.models import UserRole
from apps.leaves.filters import LeaveRequestFilter
from apps.leaves.models import LeaveRequest
from apps.leaves.permissions import IsLeaveOwnerOrAdmin
from apps.leaves.serializers import LeaveRequestSerializer, LeaveRequestUpdateSerializer


@extend_schema_view(
    list=extend_schema(tags=["Leave Requests"], description="List own leave requests."),
    retrieve=extend_schema(tags=["Leave Requests"], description="Retrieve a leave request."),
    create=extend_schema(tags=["Leave Requests"], description="Submit a new leave request."),
    update=extend_schema(tags=["Leave Requests"], description="Update a pending leave request."),
    partial_update=extend_schema(tags=["Leave Requests"], description="Partially update a pending leave request."),
    destroy=extend_schema(tags=["Leave Requests"], description="Delete a pending leave request."),
)
class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for employee leave requests.
    Employees see only their own requests; admins see all when using this endpoint.
    """

    queryset = LeaveRequest.objects.select_related("employee", "approved_by").all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsLeaveOwnerOrAdmin]
    filterset_class = LeaveRequestFilter
    search_fields = ["reason", "leave_type"]
    ordering_fields = ["created_at", "start_date", "status"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset

        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()

        if user.role == UserRole.ADMIN:
            return self.queryset
        return self.queryset.filter(employee=user)

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return LeaveRequestUpdateSerializer
        return LeaveRequestSerializer

    def perform_create(self, serializer) -> None:
        serializer.save(employee=self.request.user)

    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        if not instance.is_editable:
            return Response(
                {"detail": "Only pending leave requests can be modified."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Merge validated data with existing instance for full validation
        merged = {
            "leave_type": serializer.validated_data.get("leave_type", instance.leave_type),
            "start_date": serializer.validated_data.get("start_date", instance.start_date),
            "end_date": serializer.validated_data.get("end_date", instance.end_date),
            "reason": serializer.validated_data.get("reason", instance.reason),
        }
        full_serializer = LeaveRequestSerializer(
            instance,
            data=merged,
            partial=True,
            context=self.get_serializer_context(),
        )
        full_serializer.is_valid(raise_exception=True)
        full_serializer.save()
        return Response(full_serializer.data)

    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        if not instance.is_editable:
            return Response(
                {"detail": "Only pending leave requests can be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    def handle_exception(self, exc):
        if isinstance(exc, DjangoValidationError):
            message = exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            return Response(message, status=status.HTTP_400_BAD_REQUEST)
        return super().handle_exception(exc)
