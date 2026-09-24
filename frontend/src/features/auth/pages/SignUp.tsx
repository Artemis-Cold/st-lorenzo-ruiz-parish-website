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
import TermsAndConditionsDialog from "../components/TermsAndConditionsDialog";

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await register({
        first_name: firstName,
        last_name: lastName,
        phone,
        password,
        password_confirmation: passwordConfirmation,
        terms_accepted: termsAccepted,
      });

      navigate("/dashboard", {
        replace: true,
        state: { registrationOtpSent: response.verification.otp_sent },
      });
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

        <div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300">
            <input
              id="terms-accepted"
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => {
                setTermsAccepted(event.target.checked);
                setFieldErrors((current) => ({
                  ...current,
                  terms_accepted: [],
                }));
              }}
              disabled={submitting}
              className="mt-0.5 size-4 shrink-0 accent-[#B22222]"
            />
            <div className="text-sm leading-5 text-gray-600">
              <label htmlFor="terms-accepted" className="cursor-pointer">
                I have read and agree to the
              </label>{" "}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="font-semibold text-[#B22222] underline decoration-red-200 underline-offset-2 hover:text-[#981B1B]"
              >
                Terms and Conditions
              </button>
              .
            </div>
          </div>
          {fieldErrors.terms_accepted?.[0] && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.terms_accepted[0]}
            </p>
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

      <TermsAndConditionsDialog open={termsOpen} onOpenChange={setTermsOpen} />
    </AuthLayout>
  );
}
