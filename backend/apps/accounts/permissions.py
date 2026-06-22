"""DRF permission classes for role-based access control."""

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from apps.accounts.models import User, UserRole


class IsAdmin(BasePermission):
    """Allow access only to users with the ADMIN role."""

    message = "Administrator privileges required."

    def has_permission(self, request: Request, view: APIView) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsEmployee(BasePermission):
    """Allow access only to users with the EMPLOYEE role."""

    message = "Employee privileges required."

    def has_permission(self, request: Request, view: APIView) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.EMPLOYEE
        )


class IsAdminOrReadOnlySelf(BasePermission):
    """Admins have full access; employees can read/update their own profile."""

    def has_object_permission(self, request: Request, view: APIView, obj: User) -> bool:
        if request.user.role == UserRole.ADMIN:
            return True
        return obj == request.user
