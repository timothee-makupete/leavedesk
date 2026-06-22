from django.apps import AppConfig


class LeavesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.leaves"
    label = "leaves"
    verbose_name = "Leave Requests"

    def ready(self) -> None:
        import apps.leaves.signals  # noqa: F401
