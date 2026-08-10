import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { KeyRound, User } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { requestPasswordResetOtp, resetPasswordWithOtp, type PasswordResetPortal } from "@/api/auth";
import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import PasswordField from "../components/PasswordField";
import PhoneField from "../components/PhoneField";
import TextField from "../components/TextField";

type Errors = Record<string, string[]>;

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const portal: PasswordResetPortal = params.get("portal") === "staff" ? "staff" : "parishioner";
  const [step, setStep] = useState<"account" | "reset">("account");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const failure = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 422) {
      setErrors(error.response.data.errors ?? {});
    } else if (error instanceof AxiosError && error.response?.status === 429) {
      setMessage("Too many attempts. Please wait one minute before trying again.");
    } else {
      setMessage("Unable to process the request. Check your connection and try again.");
    }
  };

  const sendOtp = async (event?: FormEvent) => {
    event?.preventDefault();
    setSubmitting(true); setErrors({}); setMessage("");
    try {
      const response = await requestPasswordResetOtp(username, phone.replace(/\D/g, ""), portal);
      setMessage(response.message);
      setStep("reset");
    } catch (error) { failure(error); }
    finally { setSubmitting(false); }
  };

  const reset = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true); setErrors({}); setMessage("");
    try {
      const response = await resetPasswordWithOtp({ username, phone: phone.replace(/\D/g, ""), portal, otp, password, password_confirmation: confirmation });
      navigate(portal === "staff" ? "/staff/login" : "/login", { replace: true, state: { message: response.message } });
    } catch (error) { failure(error); }
    finally { setSubmitting(false); }
  };

  const backPath = portal === "staff" ? "/staff/login" : "/login";

  return <AuthLayout title="Reset Password" subtitle={`Recover your ${portal === "staff" ? "parish staff" : "parishioner"} account using the contact number on file.`}>
    <div className="mb-6 flex items-center gap-3"><div className={`h-1.5 flex-1 rounded-full ${step === "account" || step === "reset" ? "bg-[#B22222]" : "bg-gray-200"}`} /><div className={`h-1.5 flex-1 rounded-full ${step === "reset" ? "bg-[#B22222]" : "bg-gray-200"}`} /></div>
    {message && <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}

    {step === "account" ? <form onSubmit={sendOtp} className="space-y-5" noValidate>
      <div><TextField label="Username" placeholder="Enter your username" icon={User} value={username} onChange={(event) => setUsername(event.target.value)} disabled={submitting} />{errors.username?.[0] && <p className="mt-1 text-sm text-red-600">{errors.username[0]}</p>}</div>
      <div><PhoneField value={phone} onChange={(event) => setPhone(event.target.value)} disabled={submitting} />{errors.phone?.[0] && <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>}</div>
      <p className="text-xs leading-5 text-gray-500">A six-digit verification code will be sent to the contact number registered to this account.</p>
      <AuthButton type="submit" disabled={submitting}>{submitting ? "Sending Code..." : "Send Verification Code"}</AuthButton>
    </form> : <form onSubmit={reset} className="space-y-5" noValidate>
      <div><TextField label="Verification Code" placeholder="Enter the 6-digit code" icon={KeyRound} type="text" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={submitting} />{errors.otp?.[0] && <p className="mt-1 text-sm text-red-600">{errors.otp[0]}</p>}</div>
      <div><PasswordField label="New Password" placeholder="Enter a new password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} />{errors.password?.[0] && <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>}</div>
      <PasswordField label="Confirm Password" placeholder="Confirm your new password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={submitting} />
      <AuthButton type="submit" disabled={submitting}>{submitting ? "Resetting Password..." : "Reset Password"}</AuthButton>
      <button type="button" disabled={submitting} onClick={() => void sendOtp()} className="w-full text-sm font-medium text-[#B22222] hover:underline disabled:opacity-50">Resend verification code</button>
    </form>}

    <div className="mt-7 border-t pt-5 text-center"><Link to={backPath} className="text-sm font-semibold text-[#B22222] hover:underline">← Back to {portal === "staff" ? "Staff" : "Parishioner"} Login</Link></div>
  </AuthLayout>;
}
