import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { User } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import PasswordField from "../components/PasswordField";
import TextField from "../components/TextField";

export default function StaffLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { staffLogin } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      await staffLogin({ username, password });
      navigate("/staff/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Invalid staff username or password.");
        } else if (status === 403) {
          setError(
            err.response?.data?.message ??
              "This staff account is inactive. Contact an administrator.",
          );
        } else if (status === 422) {
          setFieldErrors(err.response?.data?.errors ?? {});
          setError("Please check your details and try again.");
        } else if (status === 429) {
          setError(
            "Too many login attempts. Please wait a moment and try again.",
          );
        } else if (!err.response) {
          setError(
            "Unable to reach the server. Check your connection and try again.",
          );
        } else {
          setError(
            err.response?.data?.message ??
              "Something went wrong. Please try again.",
          );
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Parish Staff Login"
      subtitle="Sign in to manage parish services and bookings."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {location.state?.message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{location.state.message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <TextField
            label="Username"
            placeholder="Enter your username"
            icon={User}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.username && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.username[0]}
            </p>
          )}
        </div>

        <div>
          <PasswordField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password?portal=staff"
            className="text-sm font-medium text-[#B22222] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton type="submit" disabled={submitting}>
          {submitting ? "Signing In..." : "Sign In"}
        </AuthButton>
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
