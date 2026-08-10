import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

export default function StaffLogoutButton({ onLogout }: { onLogout?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onLogout?.();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white">
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of the parish staff portal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-[#B22222] hover:bg-[#991B1B]"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
