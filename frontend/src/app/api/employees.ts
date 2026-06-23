import { api } from "./client";
import type { PaginatedResponse, User, UserRole } from "./types";

export interface EmployeeListParams {
  page?: number;
  department?: string;
  role?: UserRole | "";
  is_active?: boolean | "";
  search?: string;
  ordering?: string;
}

export interface CreateEmployeePayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  department: string;
  employee_id: string;
  role: UserRole;
  is_active?: boolean;
}

export type UpdateEmployeePayload = Partial<Omit<CreateEmployeePayload, "email" | "employee_id">> & {
  is_active?: boolean;
};

function cleanParams(params: object) {
  const out: Record<string, unknown> = {};
  Object.entries(params as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  });
  return out;
}

export const employeesApi = {
  async list(params: EmployeeListParams = {}) {
    const { data } = await api.get<PaginatedResponse<User>>("/admin/employees/", {
      params: cleanParams(params),
    });
    return data;
  },
  async get(id: number) {
    const { data } = await api.get<User>(`/admin/employees/${id}/`);
    return data;
  },
  async create(payload: CreateEmployeePayload) {
    const { data } = await api.post<User>("/admin/employees/", payload);
    return data;
  },
  async update(id: number, payload: UpdateEmployeePayload) {
    const { data } = await api.patch<User>(`/admin/employees/${id}/`, payload);
    return data;
  },
  async deactivate(id: number) {
    await api.delete(`/admin/employees/${id}/`);
  },
};
