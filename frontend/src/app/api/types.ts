// Types mirror the Django REST API exactly. See FRONTEND_INTEGRATION.md.

export type UserRole = "EMPLOYEE" | "ADMIN";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  department: string;
  employee_id: string;
  role: UserRole;
  is_active?: boolean;
  date_joined: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export const LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Compassionate Leave",
  "Other",
] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export interface LeaveRequest {
  id: number;
  employee: User;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  status: LeaveStatus;
  admin_comment: string;
  created_at: string;
  updated_at: string;
  approved_by: User | null;
  approved_at: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardStats {
  total_employees: number;
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
}

export type AuditAction =
  | "Leave approved"
  | "Leave rejected"
  | "Employee created"
  | "Employee updated";

export interface AuditLog {
  id: number;
  admin: User | null;
  leave_request: LeaveRequest | null;
  action: AuditAction | string;
  description: string;
  created_at: string;
}

export interface ApiError {
  detail?: string;
  non_field_errors?: string[];
  [field: string]: string | string[] | undefined;
}

// UI convenience — backend has no /departments endpoint, but the form needs options.
// Free text is also accepted; this is just a typeahead.
export const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "Customer Support",
  "Product",
  "Legal",
];
