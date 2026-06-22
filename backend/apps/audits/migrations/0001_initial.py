# Generated manually for EMS project

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("leaves", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AuditTrail",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(choices=[("Leave approved", "Leave approved"), ("Leave rejected", "Leave rejected"), ("Employee created", "Employee created"), ("Employee updated", "Employee updated")], max_length=50)),
                ("description", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("admin", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="audit_actions", to=settings.AUTH_USER_MODEL)),
                ("leave_request", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="audit_entries", to="leaves.leaverequest")),
            ],
            options={
                "verbose_name": "audit trail entry",
                "verbose_name_plural": "audit trail entries",
                "ordering": ["-created_at"],
            },
        ),
    ]
