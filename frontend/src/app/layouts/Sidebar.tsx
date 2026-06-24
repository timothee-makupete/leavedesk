import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  History,
  User as UserIcon,
  Users,
  ClipboardList,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const employeeNav = [
  { to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employee/apply-leave", label: "Apply Leave", icon: FilePlus2 },
  { to: "/employee/history", label: "Leave History", icon: History },
  { to: "/employee/profile", label: "Profile", icon: UserIcon },
];

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leaves", label: "Leave Requests", icon: ClipboardList },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { to: "/admin/profile", label: "Profile", icon: UserIcon },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const nav = isAdmin ? adminNav : employeeNav;

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-between border-b border-[#E2E8F0] px-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[#2563EB] text-sm font-semibold text-white">
            LD
          </div>
          <span className="text-sm font-semibold text-[#0F172A]">LeaveDesk</span>
        </div>
        <button
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {isAdmin ? "Administration" : "Workspace"}
        </p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#EFF6FF] text-[#1D4ED8]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"
              }`
            }
            end
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[#E2E8F0] p-4 text-xs text-slate-500">
        Logged in as
        <div className="mt-0.5 font-medium text-[#0F172A]">
          {user ? user.full_name || `${user.first_name} ${user.last_name}` : "—"}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#E2E8F0] lg:block">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-[#E2E8F0] shadow-lg">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
