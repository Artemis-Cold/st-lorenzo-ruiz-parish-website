import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

export default function PhoneVerifiedRoute() {
  const { user } = useAuth();
  const notified = useRef(false);

  useEffect(() => {
    if (!user?.phone_verified && !notified.current) {
      notified.current = true;
      toast.warning("Verify your mobile number before booking a service.");
    }
  }, [user?.phone_verified]);

  if (!user?.phone_verified) {
    return <Navigate to="/profile?verifyPhone=1" replace />;
  }

  return <Outlet />;
}
