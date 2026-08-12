import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import PasswordField from "@/features/auth/components/PasswordField";
import { updateParishionerPassword } from "@/api/auth";
import ProfileModal from "./ProfileModal";

type FieldErrors = Record<string, string[]>;

const emptyForm = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

interface PasswordSettingsProps {
  onClose: () => void;
}

export default function PasswordSettingsCard({ onClose }: PasswordSettingsProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: [] }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await updateParishionerPassword(form);
      setForm(emptyForm);
      toast.success(response.message);
      onClose();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
      } else {
        toast.error("Unable to update your password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const passwordErrors = errors.password ?? [];
  const confirmationError = passwordErrors.find((message) =>
    message.toLowerCase().includes("confirmation"),
  );
  const newPasswordError = passwordErrors.find(
    (message) => !message.toLowerCase().includes("confirmation"),
  );

  return (
    <ProfileModal
      title="Change Password"
      description="Enter your current password before setting a new one."
      onClose={onClose}
      maxWidth="max-w-lg"
    >
          <form onSubmit={submit} noValidate className="space-y-5">
            <div className="mb-2 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-[#7F1D1D]">
              <LockKeyhole size={21} className="shrink-0" />
              <p className="text-sm">Use at least 8 characters for your new password.</p>
            </div>
            <div>
              <PasswordField label="Current Password" placeholder="Enter current password" value={form.current_password} onChange={(event) => update("current_password", event.target.value)} disabled={saving} />
              {errors.current_password?.[0] && <p className="mt-1 text-xs text-red-600">{errors.current_password[0]}</p>}
            </div>
            <div>
              <PasswordField label="New Password" placeholder="At least 8 characters" value={form.password} onChange={(event) => update("password", event.target.value)} disabled={saving} />
              {newPasswordError && <p className="mt-1 text-xs text-red-600">{newPasswordError}</p>}
            </div>
            <div>
              <PasswordField label="Confirm New Password" placeholder="Repeat new password" value={form.password_confirmation} onChange={(event) => update("password_confirmation", event.target.value)} disabled={saving} />
              {confirmationError && <p className="mt-1 text-xs text-red-600">{confirmationError}</p>}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#8B1C1C] disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
    </ProfileModal>
  );
}
