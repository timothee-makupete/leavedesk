"""URL routes for admin leave management."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.leaves.admin_views import AdminLeaveViewSet

router = DefaultRouter()
router.register(r"leaves", AdminLeaveViewSet, basename="admin-leave")

urlpatterns = [
    path("", include(router.urls)),
]
