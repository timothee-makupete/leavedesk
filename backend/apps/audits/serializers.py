"""Serializers for audit trail."""

from rest_framework import serializers

from apps.accounts.serializers import UserProfileSerializer
from apps.audits.models import AuditTrail
from apps.leaves.serializers import AdminLeaveRequestSerializer


class AuditTrailSerializer(serializers.ModelSerializer):
    """Serializer for audit log entries."""

    admin = UserProfileSerializer(read_only=True)
    leave_request = AdminLeaveRequestSerializer(read_only=True)

    class Meta:
        model = AuditTrail
        fields = [
            "id",
            "admin",
            "leave_request",
            "action",
            "description",
            "created_at",
        ]
        read_only_fields = fields
