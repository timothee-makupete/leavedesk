import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type RegisterPayload } from "../api/auth";
import { tokenStore } from "../api/client";
import type { User } from "../api/types";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "first_name" | "last_name" | "phone_number" | "department">>) => Promise<User>;
  refreshUser: () => Promise<User | null>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      if (!tokenStore.getAccess()) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        if (!cancelled) setUser(profile);
      } catch {
        tokenStore.clear();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrapSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthCtx = {
    user,
    loading,
    async login(email, password) {
      const res = await authApi.login(email, password);
      setUser(res.user);
      return res.user;
    },
    async register(data) {
      return authApi.register(data);
    },
    async logout() {
      await authApi.logout();
      setUser(null);
    },
    async updateProfile(patch) {
      const u = await authApi.updateProfile(patch);
      setUser(u);
      return u;
    },
    async refreshUser() {
      if (!tokenStore.getAccess()) return null;
      try {
        const u = await authApi.getProfile();
        setUser(u);
        return u;
      } catch {
        tokenStore.clear();
        setUser(null);
        return null;
      }
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
