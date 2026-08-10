import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";

import { Link } from "react-router-dom";
import { User } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import PasswordField from "../components/PasswordField";
import TextField from "../components/TextField";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login({ username, password });

      navigate("/dashboard");
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Invalid username or password.");
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
      title="Parishioner Login"
      subtitle="Sign in to manage your bookings, requests, and parish services."
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
            onChange={(e) => setUsername(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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
            to="/forgot-password?portal=parishioner"
            className="text-sm font-medium text-[#B22222] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton type="submit" disabled={submitting}>
          {submitting ? "Signing In..." : "Sign In"}
        </AuthButton>
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
