import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { AuthLayout } from "./layouts/AuthLayout";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { EmployeeDashboard } from "./pages/employee/Dashboard";
import { ApplyLeavePage } from "./pages/employee/ApplyLeave";
import { LeaveHistoryPage } from "./pages/employee/History";
import { ProfilePage } from "./pages/employee/Profile";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminLeavesPage } from "./pages/admin/Leaves";
import { AdminEmployeesPage } from "./pages/admin/Employees";
import { AdminAuditLogsPage } from "./pages/admin/AuditLogs";
import { NotFoundPage } from "./pages/NotFound";
import { RoleRedirect } from "./routes/RoleRedirect";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<RoleRoute role="EMPLOYEE" />}>
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                <Route path="/employee/apply-leave" element={<ApplyLeavePage />} />
                <Route path="/employee/history" element={<LeaveHistoryPage />} />
                <Route path="/employee/profile" element={<ProfilePage />} />
              </Route>

              <Route element={<RoleRoute role="ADMIN" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/leaves" element={<AdminLeavesPage />} />
                <Route path="/admin/employees" element={<AdminEmployeesPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      </BrowserRouter>
    </AuthProvider>
  );
}
