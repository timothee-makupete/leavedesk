"""Mark existing users as email verified."""

from django.db import migrations


def verify_existing_users(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.all().update(email_verified=True)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_user_managers_user_email_verified_and_more"),
    ]

    operations = [
        migrations.RunPython(verify_existing_users, migrations.RunPython.noop),
    ]
