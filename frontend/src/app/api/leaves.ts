import { api } from "./client";
import type { LeaveRequest, LeaveStatus, LeaveType, PaginatedResponse } from "./types";

export interface LeaveListParams {
  page?: number;
  leave_type?: LeaveType | "";
  status?: LeaveStatus | "";
  start_date?: string;
  end_date?: string;
  created_after?: string;
  created_before?: string;
  search?: string;
  ordering?: string;
}

function cleanParams(params: object) {
  const out: Record<string, unknown> = {};
  Object.entries(params as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  });
  return out;
}

export interface CreateLeavePayload {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
}

export const leavesApi = {
  // Employee
  async listMine(params: LeaveListParams = {}) {
    const { data } = await api.get<PaginatedResponse<LeaveRequest>>("/leaves/", {
      params: cleanParams(params),
    });
    return data;
  },
  async get(id: number) {
    const { data } = await api.get<LeaveRequest>(`/leaves/${id}/`);
    return data;
  },
  async create(payload: CreateLeavePayload) {
    const { data } = await api.post<LeaveRequest>("/leaves/", payload);
    return data;
  },
  async update(id: number, payload: Partial<CreateLeavePayload>) {
    const { data } = await api.patch<LeaveRequest>(`/leaves/${id}/`, payload);
    return data;
  },
  async remove(id: number) {
    await api.delete(`/leaves/${id}/`);
  },

  // Admin
  async listAll(params: LeaveListParams = {}) {
    const { data } = await api.get<PaginatedResponse<LeaveRequest>>("/admin/leaves/", {
      params: cleanParams(params),
    });
    return data;
  },
  async getAny(id: number) {
    const { data } = await api.get<LeaveRequest>(`/admin/leaves/${id}/`);
    return data;
  },
  async approve(id: number, admin_comment = "") {
    const { data } = await api.patch<LeaveRequest>(`/admin/leaves/${id}/approve/`, {
      admin_comment,
    });
    return data;
  },
  async reject(id: number, admin_comment: string) {
    const { data } = await api.patch<LeaveRequest>(`/admin/leaves/${id}/reject/`, {
      admin_comment,
    });
    return data;
  },
};
