import { Navigate, Outlet } from "react-router-dom";

import { RouteLoadingSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function StaffProtectedRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <RouteLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  if (user?.role !== "staff" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
