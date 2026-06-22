# Employee Leave Management System — Backend API

Production-ready Django REST Framework backend for managing employee leave requests, with JWT authentication, role-based access control, admin workflows, audit logging, and email notifications.

## Features

- **JWT Authentication** — Register, login, token refresh, and logout (with refresh token blacklisting)
- **Custom User Model** — Email-based login with `EMPLOYEE` and `ADMIN` roles
- **Leave Management** — Submit, view, update, and delete leave requests with validation
- **Admin Workflow** — Approve/reject leave requests with comments
- **Employee Management** — Admin CRUD for employee accounts
- **Dashboard** — Aggregated leave and employee statistics
- **Audit Trail** — Tracks leave approvals/rejections and employee create/update events
- **Email Notifications** — Configurable emails on leave approval/rejection
- **Email Verification** — 6-digit code sent on employee self-registration
- **In-app Notifications** — Bell dropdown with read/unread tracking
- **OpenAPI Docs** — Interactive Swagger UI at `/api/docs/`
- **Security** — Password validation, throttling, pagination, CORS, environment-based config

## Tech Stack

- Python 3.12+
- Django 5+
- Django REST Framework
- PostgreSQL
- SimpleJWT
- django-cors-headers
- python-dotenv
- drf-spectacular
- django-filter

## Project Structure

```text
backend/
├── apps/
│   ├── accounts/       # User model, auth, profile
│   ├── employees/      # Admin employee CRUD, dashboard
│   ├── leaves/         # Leave requests, approval workflow
│   ├── notifications/  # In-app user notifications
│   └── audits/         # Audit trail
├── config/             # Django settings and root URLs
├── templates/emails/   # Email templates
├── manage.py
├── requirements.txt
├── .env.example
└── README.md
```

## Installation

### 1. Clone and enter the project

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy the example file and edit values for your environment:

```bash
cp .env.example .env
```

You can place `.env` in either `backend/` or the project root (`EMS/`). If both exist, `backend/.env` takes precedence.

Settings load variables via **python-dotenv** (`load_dotenv`).

## PostgreSQL Setup

### Option A — SQLite (quick local dev)

Set in `.env`:

```env
DB_ENGINE=sqlite
DB_NAME=db.sqlite3
```

Then run migrations:

```bash
python manage.py migrate
```

### Option B — PostgreSQL with Docker (recommended)

From the project root (`EMS/`):

```bash
docker compose up -d
```

Set in `.env`:

```env
DB_ENGINE=postgresql
DB_NAME=ems_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

Then run migrations:

```bash
python manage.py migrate
```

### Option C — Local PostgreSQL installation

Create a PostgreSQL database:

```sql
CREATE DATABASE ems_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE ems_db TO postgres;
```

Ensure `.env` uses `DB_ENGINE=postgresql` and matches your credentials.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | *(required)* |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `DB_ENGINE` | Database backend (`postgresql` or `sqlite`) | `postgresql` |
| `DB_NAME` | Database name or SQLite filename | `ems_db` / `db.sqlite3` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `CORS_ALLOWED_ORIGINS` | React frontend origins | `http://localhost:3000` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token lifetime | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token lifetime | `7` |
| `EMAIL_BACKEND` | Django email backend | `console` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USE_TLS` | Use TLS | `True` |
| `EMAIL_HOST_USER` | SMTP username | |
| `EMAIL_HOST_PASSWORD` | SMTP password | |
| `DEFAULT_FROM_EMAIL` | Sender address | `noreply@ems.local` |
| `FRONTEND_URL` | React app URL for emails | `http://localhost:3000` |

## Running Migrations

```bash
python manage.py migrate
```

> **Important:** After pulling schema changes (e.g. email verification or notifications), always run migrations before starting the server. Unapplied migrations will cause errors such as `no such column: accounts_user.email_verified`.

## Seeding Demo Data

Populate the database with demo admin/employee accounts and sample leave requests:

```bash
python manage.py seed
```

| Flag | Description |
|------|-------------|
| `--flush` | Remove seeded records and re-insert |
| `--password` | Set password for all demo accounts (default: `SecurePass123!`) |

Demo admin: `admin@company.com` — see command output for all accounts.

## Architecture Documentation

See [ARCHITECTURE.md](../ARCHITECTURE.md) for system design, design decisions, and problem-solving notes.

## Creating an Admin User

```bash
python manage.py createsuperuser
```

When prompted, provide email, name, employee ID, and password. The superuser is created with the `ADMIN` role.

Alternatively, promote a user in Django admin or set `role=ADMIN` when creating via `/api/admin/employees/`.

## Running the Development Server

```bash
python manage.py runserver
```

API base URL: `http://127.0.0.1:8000/api/`

## Running Tests

Tests use an in-memory SQLite database automatically:

```bash
python manage.py test
```

## API Documentation

Interactive Swagger UI:

```text
http://127.0.0.1:8000/api/docs/
```

OpenAPI schema:

```text
http://127.0.0.1:8000/api/schema/
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register employee |
| POST | `/api/auth/verify-email/` | Verify email with 6-digit code |
| POST | `/api/auth/resend-verification/` | Resend verification code |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| POST | `/api/auth/logout/` | Blacklist refresh token |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/` | View profile |
| PUT/PATCH | `/api/profile/` | Update profile |

### Leave Requests (Employee)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/leaves/` | Submit leave request |
| GET | `/api/leaves/` | List own requests |
| GET | `/api/leaves/{id}/` | Retrieve request |
| PUT/PATCH | `/api/leaves/{id}/` | Update pending request |
| DELETE | `/api/leaves/{id}/` | Delete pending request |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/` | List own notifications |
| GET | `/api/notifications/unread-count/` | Unread notification count |
| PATCH | `/api/notifications/{id}/read/` | Mark one as read |
| POST | `/api/notifications/mark-all-read/` | Mark all as read |

### Admin — Leaves

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/leaves/` | List all requests |
| GET | `/api/admin/leaves/{id}/` | Retrieve request |
| PATCH | `/api/admin/leaves/{id}/approve/` | Approve request |
| PATCH | `/api/admin/leaves/{id}/reject/` | Reject request |

### Admin — Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/employees/` | List employees |
| GET | `/api/admin/employees/{id}/` | Retrieve employee |
| POST | `/api/admin/employees/` | Create employee |
| PUT/PATCH | `/api/admin/employees/{id}/` | Update employee |
| DELETE | `/api/admin/employees/{id}/` | Deactivate employee |

### Admin — Dashboard & Audit

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard/` | Dashboard statistics |
| GET | `/api/admin/audit-logs/` | Paginated audit logs |

## Authentication Header

```http
Authorization: Bearer <access_token>
```

## Example: Register and Submit Leave

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "employee_id": "EMP001",
    "department": "Engineering"
  }'

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "john@company.com", "password": "SecurePass123!"}'

# Submit leave
curl -X POST http://127.0.0.1:8000/api/leaves/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type": "Annual Leave",
    "start_date": "2026-07-01",
    "end_date": "2026-07-05",
    "reason": "Family vacation"
  }'
```

## License

MIT
