"""URL routes for employee leave requests."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.leaves.views import LeaveRequestViewSet

router = DefaultRouter()
router.register(r"", LeaveRequestViewSet, basename="leave-request")

urlpatterns = [
    path("", include(router.urls)),
]
