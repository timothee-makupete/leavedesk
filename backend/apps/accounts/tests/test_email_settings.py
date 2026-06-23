from django.conf import settings
from django.test import SimpleTestCase


class EmailBackendSettingsTest(SimpleTestCase):
    def test_default_email_backend_uses_smtp(self):
        self.assertEqual(
            settings.EMAIL_BACKEND,
            "django.core.mail.backends.smtp.EmailBackend",
        )
