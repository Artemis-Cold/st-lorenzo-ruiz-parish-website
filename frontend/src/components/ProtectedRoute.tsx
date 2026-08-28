import { Navigate, Outlet } from "react-router-dom";
import { RouteLoadingSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <RouteLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "staff" || user?.role === "admin") {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <Outlet />;
}
