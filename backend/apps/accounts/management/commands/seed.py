"""Populate the database with demo users and leave requests."""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User, UserRole
from apps.audits.services import audit_employee_created
from apps.leaves.models import LeaveRequest, LeaveStatus, LeaveType
from apps.leaves.services import approve_leave_request, reject_leave_request

DEFAULT_PASSWORD = "SecurePass123!"

SEED_ADMIN = {
    "email": "admin@company.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "employee_id": "ADM001",
    "department": "Human Resources",
    "phone_number": "+15550000001",
}

SEED_EMPLOYEES = [
    {
        "email": "john.doe@company.com",
        "first_name": "John",
        "last_name": "Doe",
        "employee_id": "EMP001",
        "department": "Engineering",
        "phone_number": "+15550000002",
    },
    {
        "email": "jane.smith@company.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "employee_id": "EMP002",
        "department": "Marketing",
        "phone_number": "+15550000003",
    },
    {
        "email": "mike.wilson@company.com",
        "first_name": "Mike",
        "last_name": "Wilson",
        "employee_id": "EMP003",
        "department": "Finance",
        "phone_number": "+15550000004",
    },
    {
        "email": "emily.brown@company.com",
        "first_name": "Emily",
        "last_name": "Brown",
        "employee_id": "EMP004",
        "department": "Operations",
        "phone_number": "+15550000005",
    },
]

SEED_EMAILS = [SEED_ADMIN["email"], *(e["email"] for e in SEED_EMPLOYEES)]


class Command(BaseCommand):
    help = "Populate the database with demo users, leave requests, notifications, and audit data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete previously seeded users and their related data before seeding",
        )
        parser.add_argument(
            "--password",
            default=DEFAULT_PASSWORD,
            help=f"Password for all seeded accounts (default: {DEFAULT_PASSWORD})",
        )

    def handle(self, *args, **options):
        password = options["password"]
        flush = options["flush"]

        if flush:
            self._flush_seed_data()

        if User.objects.filter(email=SEED_ADMIN["email"]).exists():
            self.stdout.write(
                self.style.WARNING(
                    "Seed data already exists. Use --flush to remove and re-seed."
                )
            )
            self._print_credentials(password)
            return

        with transaction.atomic():
            admin = self._create_admin(password)
            employees = [self._create_employee(data, password, admin) for data in SEED_EMPLOYEES]
            self._create_leave_requests(admin, employees)

        self.stdout.write(self.style.SUCCESS("Database seeded successfully."))
        self._print_credentials(password)

    def _flush_seed_data(self):
        deleted, _ = User.objects.filter(email__in=SEED_EMAILS).delete()
        self.stdout.write(self.style.WARNING(f"Removed {deleted} seeded object(s)."))

    def _create_admin(self, password: str) -> User:
        user = User.objects.create_user(
            password=password,
            role=UserRole.ADMIN,
            is_staff=True,
            email_verified=True,
            **SEED_ADMIN,
        )
        self.stdout.write(f"  Admin: {user.email}")
        return user

    def _create_employee(self, data: dict, password: str, admin: User) -> User:
        user = User.objects.create_user(
            password=password,
            role=UserRole.EMPLOYEE,
            email_verified=True,
            **data,
        )
        audit_employee_created(employee=user, admin=admin)
        self.stdout.write(f"  Employee: {user.email}")
        return user

    def _create_leave_requests(self, admin: User, employees: list[User]) -> None:
        today = timezone.localdate()

        pending = LeaveRequest.objects.create(
            employee=employees[0],
            leave_type=LeaveType.ANNUAL,
            start_date=today + timedelta(days=14),
            end_date=today + timedelta(days=18),
            reason="Family vacation",
        )
        self.stdout.write(f"  Pending leave: {pending}")

        sick = LeaveRequest.objects.create(
            employee=employees[1],
            leave_type=LeaveType.SICK,
            start_date=today + timedelta(days=21),
            end_date=today + timedelta(days=22),
            reason="Medical appointment",
        )
        approve_leave_request(sick, admin, admin_comment="Get well soon.")
        self.stdout.write(f"  Approved leave: {sick}")

        rejected = LeaveRequest.objects.create(
            employee=employees[2],
            leave_type=LeaveType.ANNUAL,
            start_date=today + timedelta(days=7),
            end_date=today + timedelta(days=10),
            reason="Personal travel",
        )
        reject_leave_request(
            rejected,
            admin,
            admin_comment="Critical project deadline during this period.",
        )
        self.stdout.write(f"  Rejected leave: {rejected}")

        LeaveRequest.objects.create(
            employee=employees[3],
            leave_type=LeaveType.COMPASSIONATE,
            start_date=today + timedelta(days=30),
            end_date=today + timedelta(days=32),
            reason="Family matter",
        )
        self.stdout.write("  Pending leave for emily.brown@company.com")

        past_approved = LeaveRequest.objects.create(
            employee=employees[0],
            leave_type=LeaveType.ANNUAL,
            start_date=today + timedelta(days=45),
            end_date=today + timedelta(days=47),
            reason="Long weekend trip",
        )
        approve_leave_request(past_approved, admin, admin_comment="Approved.")
        self.stdout.write(f"  Approved leave: {past_approved}")

    def _print_credentials(self, password: str):
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Demo accounts:"))
        self.stdout.write(f"  Admin:     {SEED_ADMIN['email']} / {password}")
        for employee in SEED_EMPLOYEES:
            self.stdout.write(f"  Employee:  {employee['email']} / {password}")
        self.stdout.write("")
        self.stdout.write("Log in at the frontend, or use POST /api/auth/login/")
