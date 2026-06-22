"""Views for admin employee management and dashboard."""

from django.contrib.auth import get_user_model
from drf_spectacular.utils import OpenApiExample, extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import UserRole
from apps.accounts.permissions import IsAdmin
from apps.accounts.serializers import AdminUserSerializer
from apps.audits.services import audit_employee_created, audit_employee_updated
from apps.employees.filters import EmployeeFilter
from apps.employees.services import get_dashboard_statistics

User = get_user_model()


@extend_schema_view(
    list=extend_schema(tags=["Admin - Employees"], description="List all employees."),
    retrieve=extend_schema(tags=["Admin - Employees"], description="Retrieve an employee."),
    create=extend_schema(tags=["Admin - Employees"], description="Create a new employee."),
    update=extend_schema(tags=["Admin - Employees"], description="Update an employee."),
    partial_update=extend_schema(tags=["Admin - Employees"], description="Partially update an employee."),
    destroy=extend_schema(tags=["Admin - Employees"], description="Deactivate an employee."),
)
class AdminEmployeeViewSet(viewsets.ModelViewSet):
    """Admin CRUD for employee accounts."""

    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_class = EmployeeFilter
    search_fields = ["email", "first_name", "last_name", "employee_id", "department"]
    ordering_fields = ["date_joined", "first_name", "last_name", "email"]

    queryset = User.objects.all()

    def perform_create(self, serializer) -> None:
        user = serializer.save()
        audit_employee_created(employee=user, admin=self.request.user)

    def perform_update(self, serializer) -> None:
        user = serializer.save()
        audit_employee_updated(employee=user, admin=self.request.user)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        """Soft-delete by deactivating the employee account."""
        instance = self.get_object()
        if instance.role == UserRole.ADMIN:
            return Response(
                {"detail": "Administrator accounts cannot be deleted via this endpoint."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        audit_employee_updated(employee=instance, admin=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DashboardView(APIView):
    """Admin dashboard with leave and employee statistics."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        tags=["Admin - Dashboard"],
        responses={
            200: {
                "type": "object",
                "properties": {
                    "total_employees": {"type": "integer", "example": 25},
                    "total_requests": {"type": "integer", "example": 120},
                    "pending_requests": {"type": "integer", "example": 10},
                    "approved_requests": {"type": "integer", "example": 80},
                    "rejected_requests": {"type": "integer", "example": 30},
                },
            }
        },
        examples=[
            OpenApiExample(
                "Dashboard Stats",
                value={
                    "total_employees": 25,
                    "total_requests": 120,
                    "pending_requests": 10,
                    "approved_requests": 80,
                    "rejected_requests": 30,
                },
                response_only=True,
            ),
        ],
    )
    def get(self, request: Request) -> Response:
        return Response(get_dashboard_statistics())
