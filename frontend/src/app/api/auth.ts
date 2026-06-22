import { api, tokenStore, USER_KEY } from "./client";
import type { AuthResponse, User } from "./types";

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  department: string;
  employee_id: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login/", { email, password });
    tokenStore.setTokens(data.access, data.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>("/auth/register/", payload);
    return data;
  },

  async logout(): Promise<void> {
    const refresh = tokenStore.getRefresh();
    try {
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch {
      // ignore — clear local state regardless
    } finally {
      tokenStore.clear();
    }
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/profile/");
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  },

  async updateProfile(patch: Partial<Pick<User, "first_name" | "last_name" | "phone_number" | "department">>): Promise<User> {
    const { data } = await api.patch<User>("/profile/", patch);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  },
};
