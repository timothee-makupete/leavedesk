# LeaveDesk — Employee Leave Management (Frontend)

A React + TypeScript frontend for the **Employee Leave Management System** Django REST API.
Built as a professional internal HR tool: practical layout, real data flows, and role-based
access for `EMPLOYEE` and `ADMIN` users.

## Tech stack

- React 19 + TypeScript
- React Router DOM v6
- Axios (with JWT access + refresh interceptors)
- React Hook Form + Zod
- Recharts (dashboard charts)
- TailwindCSS
- react-toastify

> The project ships inside a TanStack Start shell, but the entire application
> mounts under a single catch-all route (`src/routes/$.tsx`) and is implemented
> with React Router DOM. All app code lives under `src/app/`.

## Backend API

This frontend talks to the Django REST backend described in
`FRONTEND_INTEGRATION.md`.

| Item | Value |
|------|-------|
| API base URL (dev) | `http://127.0.0.1:8000` |
| API prefix | `/api/` |
| Auth | JWT Bearer (access + refresh) |
| Pagination | `{ count, next, previous, results }` |

## Configuration

Create a `.env` file at the project root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The Axios client (`src/app/api/client.ts`) prefixes every request with `/api`
and attaches the access token from `localStorage`. On `401`, it transparently
refreshes via `/api/auth/token/refresh/` and replays the original request.
Refresh-token rotation is honoured — the new `refresh` value is persisted.

### CORS

Ensure your backend's `CORS_ALLOWED_ORIGINS` includes the dev origin Vite
serves on (typically `http://localhost:8080`). Example:

```env
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

## Project structure

```
src/app/
├── api/
│   ├── client.ts         # Axios instance, JWT refresh, getErrorMessage
│   ├── auth.ts           # login, register, logout, profile
│   ├── leaves.ts         # employee + admin leave endpoints
│   ├── employees.ts      # admin employee CRUD
│   ├── auditLogs.ts      # admin audit trail
│   ├── dashboard.ts      # admin dashboard stats
│   └── types.ts          # DRF-shaped TS interfaces
├── components/           # Reusable UI primitives (Table, Modal, Badge, ...)
├── context/
│   └── AuthContext.tsx   # user state, tokens, login/logout/refresh
├── layouts/              # AppLayout, AuthLayout, Sidebar, Topbar
├── pages/
│   ├── auth/             # Login, Register
│   ├── employee/         # Dashboard, ApplyLeave, History, Profile
│   └── admin/            # Dashboard, Leaves, Employees, AuditLogs
├── routes/               # ProtectedRoute, RoleRoute, RoleRedirect
├── utils/format.ts       # date helpers
├── validations/          # Zod schemas (auth, leave, employee)
└── App.tsx               # Router + providers
```

## Auth & RBAC

- Tokens stored in `localStorage` (`ems.access`, `ems.refresh`, `ems.user`).
- `AuthContext` exposes `user`, `login`, `register`, `logout`, `updateProfile`.
- `ProtectedRoute` blocks unauthenticated users.
- `RoleRoute role="ADMIN" | "EMPLOYEE"` blocks the wrong role and redirects to
  the correct dashboard.
- After login the user is routed to `/admin/dashboard` or `/employee/dashboard`
  based on `user.role`.

## Error handling

All API failures route through `getErrorMessage(err)` which understands the DRF
shapes: `{ detail }`, `{ non_field_errors }`, and per-field arrays like
`{ email: ["already exists"] }`. The Axios response interceptor also:

- Refreshes the access token on `401` and retries the request once
- Clears tokens and redirects to `/login` if refresh fails
- Shows a friendly toast on `429` (rate limited) and `5xx`

## Running

```bash
npm install
npm run dev
```

Then open http://localhost:8080 and sign in with an account that exists in your
Django database. New employees can self-register at `/register` — admins must be
created by another admin via `/admin/employees`.

## Creating a Super Admin

To create a super admin user, run the Django management command from the backend
directory:

```bash
cd ../backend
python manage.py createsuperuser
```

Follow the prompts to enter:
- **Email** — unique email address
- **First Name** — first name
- **Last Name** — last name
- **Employee ID** — unique employee identifier
- **Password** — secure password

The super admin user can then log in to the frontend at `http://localhost:8080`
with their email and password, and will have access to all admin features including
employee management, leave approvals, and audit logs.
