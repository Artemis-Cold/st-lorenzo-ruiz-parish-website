import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function GuestRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
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
