import { Link } from "react-router-dom";
import { User } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import PasswordField from "../components/PasswordField";
import TextField from "../components/TextField";

export default function StaffLogin() {
  return (
    <AuthLayout
      title="Parish Staff Login"
      subtitle="Sign in to manage parish services and bookings."
    >
      <form className="space-y-5">
        <TextField
          label="Username"
          placeholder="Enter your username"
          icon={User}
        />

        <PasswordField label="Password" placeholder="Enter your password" />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[#B22222] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton type="submit">Sign In</AuthButton>
      </form>

      {/* Staff Login */}
      <div className="mt-8 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">Not a parish staff member?</p>

        <Link
          to="/login"
          className="mt-2 inline-block font-semibold text-[#B22222] transition hover:underline"
        >
          Parishioner Login →
        </Link>
      </div>
    </AuthLayout>
  );
}
