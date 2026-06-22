"""Root-level API views."""

from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    tags=["Root"],
    summary="API root",
    description="Overview of the Employee Leave Management System API and available endpoints.",
    responses={
        200: {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "version": {"type": "string"},
                "description": {"type": "string"},
                "documentation": {"type": "object"},
                "endpoints": {"type": "object"},
            },
        }
    },
)
class APIRootView(APIView):
    """Return API metadata and links to main resources."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        base = request.build_absolute_uri("/").rstrip("/")
        return Response(
            {
                "name": "Employee Leave Management System API",
                "version": "1.0.0",
                "description": (
                    "REST API for employee leave requests, profiles, "
                    "admin approvals, dashboard statistics, and audit logs."
                ),
                "documentation": {
                    "swagger_ui": f"{base}/api/docs/",
                    "openapi_schema": f"{base}/api/schema/",
                },
                "endpoints": {
                    "authentication": {
                        "register": f"{base}/api/auth/register/",
                        "login": f"{base}/api/auth/login/",
                        "token_refresh": f"{base}/api/auth/token/refresh/",
                        "logout": f"{base}/api/auth/logout/",
                    },
                    "profile": f"{base}/api/profile/",
                    "leave_requests": f"{base}/api/leaves/",
                    "admin": {
                        "employees": f"{base}/api/admin/employees/",
                        "leaves": f"{base}/api/admin/leaves/",
                        "dashboard": f"{base}/api/admin/dashboard/",
                        "audit_logs": f"{base}/api/admin/audit-logs/",
                    },
                    "django_admin": f"{base}/admin/",
                },
                "authentication_note": (
                    "Protected endpoints require a JWT Bearer token. "
                    "Obtain tokens via POST /api/auth/login/."
                ),
            }
        )
