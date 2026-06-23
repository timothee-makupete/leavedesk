import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import type { ApiError } from "./types";

//const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://127.0.0.1:8000";
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://127.0.0.1:8000";
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export const ACCESS_KEY = "ems.access";
export const REFRESH_KEY = "ems.refresh";
export const USER_KEY = "ems.user";

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const access = tokenStore.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// --- Token refresh handling --------------------------------------------------
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshing) return refreshing;
  const refresh = tokenStore.getRefresh();
  if (!refresh) throw new Error("No refresh token");
  refreshing = axios
    .post<{ access: string; refresh: string }>(
      `${API_BASE_URL}/api/auth/token/refresh/`,
      { refresh },
      { headers: { "Content-Type": "application/json" } },
    )
    .then((res) => {
      tokenStore.setTokens(res.data.access, res.data.refresh);
      return res.data.access;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const url = original?.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/verify-email") ||
      url.includes("/auth/resend-verification") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password") ||
      url.includes("/auth/token/refresh");

    if (status === 401 && original && !original._retry && !isAuthEndpoint && tokenStore.getRefresh()) {
      original._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newAccess}` };
        return api(original);
      } catch {
        tokenStore.clear();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.assign("/login");
        }
        return Promise.reject(error);
      }
    }

    if (status === 401 && !isAuthEndpoint) {
      tokenStore.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    } else if (status === 429) {
      toast.error("Too many requests. Please slow down and try again shortly.");
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again later.");
    }
    return Promise.reject(error);
  },
);

/** Extract a user-friendly message from a DRF error response. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  const data = (error as AxiosError<ApiError>)?.response?.data;
  if (!data) {
    const msg = (error as Error)?.message;
    return msg || fallback;
  }
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors[0];
  }
  const firstKey = Object.keys(data)[0];
  if (!firstKey) return fallback;
  const value = data[firstKey];
  if (Array.isArray(value)) return `${firstKey}: ${value[0]}`;
  if (typeof value === "string") return value;
  return fallback;
}
