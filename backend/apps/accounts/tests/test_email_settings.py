from unittest.mock import patch

from django.test import SimpleTestCase

from config import settings as settings_module


class EmailBackendSettingsTest(SimpleTestCase):
    def test_default_email_backend_uses_smtp_outside_tests(self):
        with patch.object(settings_module.sys, "argv", ["manage.py"]):
            self.assertEqual(
                settings_module.get_default_email_backend(),
                "django.core.mail.backends.smtp.EmailBackend",
            )

    def test_default_email_backend_uses_locmem_while_running_tests(self):
        with patch.object(settings_module.sys, "argv", ["manage.py", "test"]):
            self.assertEqual(
                settings_module.get_default_email_backend(),
                "django.core.mail.backends.locmem.EmailBackend",
            )
