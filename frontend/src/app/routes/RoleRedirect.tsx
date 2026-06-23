import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"}
      replace
    />
  );
}
