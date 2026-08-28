import { Navigate, Outlet } from "react-router-dom";
import { RouteLoadingSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function GuestRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <RouteLoadingSkeleton />;
  }

  if (isAuthenticated) {
    const destination =
      user?.role === "staff" || user?.role === "admin"
        ? "/staff/dashboard"
        : "/dashboard";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
