import { Link } from "react-router-dom";
import { User } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import PasswordField from "../components/PasswordField";
import TextField from "../components/TextField";

export default function Login() {
  return (
    <AuthLayout
      title="Parishioner Login"
      subtitle="Sign in to manage your bookings, requests, and parish services."
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

      {/* Register */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-[#B22222] hover:underline"
        >
          Create Account
        </Link>
      </p>

      {/* Staff Login */}
      <div className="mt-8 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">Are you a parish staff member?</p>

        <Link
          to="/staff/login"
          className="mt-2 inline-block font-semibold text-[#B22222] transition hover:underline"
        >
          Staff Login →
        </Link>
      </div>
    </AuthLayout>
  );
}
