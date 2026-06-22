"""Serializers for leave request management."""

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.accounts.serializers import UserProfileSerializer
from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType
from apps.leaves.validators import calculate_number_of_days, validate_leave_dates, validate_no_overlap


class LeaveRequestSerializer(serializers.ModelSerializer):
    """Serializer for employee leave request CRUD."""

    employee = UserProfileSerializer(read_only=True)
    approved_by = UserProfileSerializer(read_only=True)
    number_of_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee",
            "leave_type",
            "start_date",
            "end_date",
            "number_of_days",
            "reason",
            "status",
            "admin_comment",
            "created_at",
            "updated_at",
            "approved_by",
            "approved_at",
        ]
        read_only_fields = [
            "id",
            "employee",
            "number_of_days",
            "status",
            "admin_comment",
            "created_at",
            "updated_at",
            "approved_by",
            "approved_at",
        ]

    def validate_leave_type(self, value: str) -> str:
        valid_types = [choice[0] for choice in LeaveType.choices]
        if value not in valid_types:
            raise serializers.ValidationError("Invalid leave type.")
        return value

    def validate(self, attrs: dict) -> dict:
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))

        if start_date and end_date:
            try:
                validate_leave_dates(start_date, end_date)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(exc.message_dict if hasattr(exc, "message_dict") else exc.messages)

            employee = self.context["request"].user
            try:
                validate_no_overlap(
                    employee=employee,
                    start_date=start_date,
                    end_date=end_date,
                    exclude_pk=self.instance.pk if self.instance else None,
                )
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"non_field_errors": exc.messages})

            attrs["number_of_days"] = calculate_number_of_days(start_date, end_date)

        return attrs

    def create(self, validated_data: dict) -> LeaveRequest:
        validated_data["employee"] = self.context["request"].user
        validated_data["status"] = LeaveStatus.PENDING
        return super().create(validated_data)


class LeaveRequestUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating pending leave requests."""

    class Meta:
        model = LeaveRequest
        fields = ["leave_type", "start_date", "end_date", "reason"]

    def validate(self, attrs: dict) -> dict:
        if self.instance and not self.instance.is_editable:
            raise serializers.ValidationError(
                "Only pending leave requests can be modified."
            )
        return attrs


class AdminLeaveActionSerializer(serializers.Serializer):
    """Serializer for admin approve/reject actions."""

    admin_comment = serializers.CharField(required=False, allow_blank=True, default="")


class AdminLeaveRequestSerializer(serializers.ModelSerializer):
    """Detailed serializer for admin leave management."""

    employee = UserProfileSerializer(read_only=True)
    approved_by = UserProfileSerializer(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee",
            "leave_type",
            "start_date",
            "end_date",
            "number_of_days",
            "reason",
            "status",
            "admin_comment",
            "created_at",
            "updated_at",
            "approved_by",
            "approved_at",
        ]
        read_only_fields = fields
