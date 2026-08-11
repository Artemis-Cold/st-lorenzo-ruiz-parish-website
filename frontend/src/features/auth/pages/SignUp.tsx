import { useAuth } from "@/contexts/AuthContext";
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import { AxiosError } from "axios";

import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import PasswordField from "../components/PasswordField";
import PhoneField from "../components/PhoneField";
import TextField from "../components/TextField";

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        phone,
        username,
        password,
        password_confirmation: passwordConfirmation,
      });

      navigate("/dashboard");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 422) {
        setFieldErrors(err.response.data.errors ?? {});
        setError("Please review the highlighted fields.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register to access parish services online."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <TextField
            label="First Name"
            placeholder="Enter First Name"
            icon={UserIcon}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.first_name && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.first_name[0]}
            </p>
          )}
        </div>

        <div>
          <TextField
            label="Last Name"
            placeholder="Enter Last Name"
            icon={UserIcon}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.last_name && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.last_name[0]}
            </p>
          )}
        </div>

        <div>
          <PhoneField
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.phone[0]}</p>
          )}
        </div>

        <div>
          <TextField
            label="Username"
            placeholder="Enter Username"
            icon={UserIcon}
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))
            }
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

        <div>
          <PasswordField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.password?.some((msg) =>
            msg.toLowerCase().includes("confirmation"),
          ) && (
            <p className="mt-1 text-sm text-red-600">Passwords do not match.</p>
          )}
        </div>

        <AuthButton type="submit" disabled={submitting}>
          {submitting ? "Creating Account..." : "Create Account"}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#B22222]">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
