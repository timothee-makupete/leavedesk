# Generated manually for EMS project

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="LeaveRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("leave_type", models.CharField(choices=[("Annual Leave", "Annual Leave"), ("Sick Leave", "Sick Leave"), ("Maternity Leave", "Maternity Leave"), ("Paternity Leave", "Paternity Leave"), ("Compassionate Leave", "Compassionate Leave"), ("Other", "Other")], max_length=50)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("number_of_days", models.PositiveIntegerField(editable=False)),
                ("reason", models.TextField()),
                ("status", models.CharField(choices=[("Pending", "Pending"), ("Approved", "Approved"), ("Rejected", "Rejected")], default="Pending", max_length=20)),
                ("admin_comment", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("approved_at", models.DateTimeField(blank=True, null=True)),
                ("approved_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="approved_leaves", to=settings.AUTH_USER_MODEL)),
                ("employee", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="leave_requests", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "leave request",
                "verbose_name_plural": "leave requests",
                "ordering": ["-created_at"],
            },
        ),
    ]
