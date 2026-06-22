"""URL routes for audit logs."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.audits.views import AuditTrailViewSet

router = DefaultRouter()
router.register(r"audit-logs", AuditTrailViewSet, basename="audit-log")

urlpatterns = [
    path("", include(router.urls)),
]
