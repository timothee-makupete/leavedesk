"""Permission classes for leave request access control."""

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from apps.accounts.models import UserRole
from apps.leaves.models import LeaveRequest


class IsLeaveOwnerOrAdmin(BasePermission):
    """Employees can only access their own leave requests; admins can access all."""

    message = "You do not have permission to access this leave request."

    def has_object_permission(self, request: Request, view: APIView, obj: LeaveRequest) -> bool:
        if not request.user.is_authenticated:
            return False
        if request.user.role == UserRole.ADMIN:
            return True
        return obj.employee_id == request.user.id
