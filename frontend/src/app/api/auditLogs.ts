import { api } from "./client";
import type { AuditLog, PaginatedResponse } from "./types";

export interface AuditLogParams {
  page?: number;
  action?: string;
  admin?: number;
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

export const auditLogsApi = {
  async list(params: AuditLogParams = {}) {
    const { data } = await api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs/", {
      params: cleanParams(params),
    });
    return data;
  },
};
