import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canStaffPage, staffHome } from "@/features/staff/permissions";

import { RouteLoadingSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function StaffProtectedRoute() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  if (user?.role !== "staff" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.is_active === false)
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8">
        <h1 className="text-xl font-bold">Account inactive</h1>
        <p>Please contact the Main Admin to restore your access.</p>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg border px-4 py-2"
        >
          Sign out
        </button>
      </div>
    );
  if (!canStaffPage(user, location.pathname.replace(/\/$/, "")))
    return <Navigate to={staffHome(user)} replace />;
  return <Outlet />;
}
