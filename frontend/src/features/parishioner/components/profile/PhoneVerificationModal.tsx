import { useEffect, useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { requestPhoneVerificationOtp, verifyPhoneNumber } from "@/api/auth";
import ProfileModal from "./ProfileModal";

type FieldErrors = Record<string, string[]>;

interface PhoneVerificationModalProps {
  phone: string;
  username: string;
  onClose: () => void;
  onVerified: () => Promise<void> | void;
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 7) return phone;

  return `${digits.slice(0, 4)} ${"•".repeat(3)} ${digits.slice(-4)}`;
}

export default function PhoneVerificationModal({
  phone,
  username,
  onClose,
  onVerified,
}: PhoneVerificationModalProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [secondsUntilResend, setSecondsUntilResend] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (secondsUntilResend <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsUntilResend((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsUntilResend]);

  const sendCode = async () => {
    setSending(true);
    setErrors({});

    try {
      const response = await requestPhoneVerificationOtp();
      setOtpSent(true);
      setSecondsUntilResend(60);
      toast.success(response.message);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
      } else if (
        error instanceof AxiosError &&
        error.response?.status === 429
      ) {
        toast.error("Too many code requests. Please wait before trying again.");
      } else {
        toast.error("Unable to send the verification code. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});

    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: ["Enter the 6-digit code sent to your phone."] });
      return;
    }

    setVerifying(true);

    try {
      const response = await verifyPhoneNumber(otp);
      await onVerified();
      toast.success(response.message);
      onClose();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
      } else {
        toast.error("Unable to verify your mobile number. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ProfileModal
      title="Verify Mobile Number"
      description="Confirm that this mobile number belongs to you."
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
              <ShieldCheck size={21} />
            </span>
            <div>
              <p className="font-semibold text-amber-950">Booking protection</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Verification is required before you can book a parish service.
                The code {otpSent ? "was" : "will be"} sent through SMS to{" "}
                {maskPhone(phone)}.
              </p>
              <p className="mt-2 text-sm text-amber-900">
                Your account username is{" "}
                <span className="font-semibold">{username}</span>.
              </p>
            </div>
          </div>
        </div>

        {!otpSent ? (
          <button
            type="button"
            onClick={sendCode}
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#8B1C1C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <MessageSquareText size={19} />
            )}
            {sending ? "Sending Code..." : "Send Verification Code"}
          </button>
        ) : (
          <>
            <div>
              <label
                htmlFor="phone-verification-otp"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Verification code
              </label>
              <input
                id="phone-verification-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setErrors((current) => ({ ...current, otp: [] }));
                }}
                placeholder="Enter 6-digit code"
                aria-invalid={Boolean(errors.otp?.[0])}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl font-semibold tracking-[0.35em] outline-none transition focus:border-[#B22222] focus:ring-4 focus:ring-red-100"
              />
              {errors.otp?.[0] && (
                <p className="mt-1.5 text-sm text-red-600">{errors.otp[0]}</p>
              )}
            </div>

            <button
              type="button"
              onClick={sendCode}
              disabled={sending || secondsUntilResend > 0}
              className="text-sm font-semibold text-[#B22222] transition hover:text-[#8B1C1C] disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {secondsUntilResend > 0
                ? `Send another code in ${secondsUntilResend}s`
                : sending
                  ? "Sending another code..."
                  : "Send another code"}
            </button>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Verify later
              </button>
              <button
                type="submit"
                disabled={verifying}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#8B1C1C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifying ? (
                  <LoaderCircle size={19} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={19} />
                )}
                {verifying ? "Verifying..." : "Verify Number"}
              </button>
            </div>
          </>
        )}

        {errors.phone?.[0] && (
          <p className="text-sm text-red-600">{errors.phone[0]}</p>
        )}
      </form>
    </ProfileModal>
  );
}
