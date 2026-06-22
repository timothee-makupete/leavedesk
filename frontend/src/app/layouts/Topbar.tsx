import { Bell, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initialsFor } from "../utils/format";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user ? initialsFor(user.first_name, user.last_name) : "?";
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <h2 className="text-sm font-medium text-slate-500">
          {isAdmin ? "HR Administration" : "Employee Workspace"}
        </h2>
      </div>
      <button
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#DC2626]" />
      </button>
      <div className="flex items-center gap-3 border-l border-[#E2E8F0] pl-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#1D4ED8]">
          {initials}
        </div>
        <div className="hidden text-sm sm:block">
          <div className="font-medium text-[#0F172A]">
            {user ? user.full_name || `${user.first_name} ${user.last_name}` : "—"}
          </div>
          <div className="text-xs text-slate-500">{isAdmin ? "Administrator" : "Employee"}</div>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>
    </header>
  );
}
