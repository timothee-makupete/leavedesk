import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export function AuthLayout() {
  const { user } = useAuth();
  if (user) {
    return (
      <Navigate
        to={user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"}
        replace
      />
    );
  }
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="hidden flex-col justify-between border-r border-[#E2E8F0] bg-white p-12 lg:flex">
          <Logo />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
              Employee Leave Management
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              A single workspace for HR teams and employees to request, review and track
              time-off in one place.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>• Submit leave requests in seconds</li>
              <li>• Track approvals and remaining balance</li>
              <li>• Manage employees and policies as an admin</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} LeaveDesk Inc.</p>
        </div>
        <div className="flex items-center justify-center p-4 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
