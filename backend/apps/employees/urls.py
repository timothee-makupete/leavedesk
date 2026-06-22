"""URL routes for admin employee management and dashboard."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.employees.views import AdminEmployeeViewSet, DashboardView

router = DefaultRouter()
router.register(r"employees", AdminEmployeeViewSet, basename="admin-employee")

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="admin-dashboard"),
    path("", include(router.urls)),
]
