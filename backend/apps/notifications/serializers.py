"""Serializers for in-app notifications."""

from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for listing and updating notifications."""

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "leave_request",
            "is_read",
            "created_at",
        ]
        read_only_fields = fields
