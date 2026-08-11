import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import PasswordField from "@/features/auth/components/PasswordField";
import { updateParishionerPassword } from "@/api/auth";

type FieldErrors = Record<string, string[]>;

const emptyForm = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

export default function PasswordSettingsCard() {
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
    <section className="rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-xl bg-red-50 p-2.5 text-[#B22222]">
          <LockKeyhole size={20} />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-[#292524]">
            Password &amp; Security
          </h2>
          <p className="text-xs text-gray-500">
            Use your current password to protect this change.
          </p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <PasswordField
            label="Current Password"
            placeholder="Enter current password"
            value={form.current_password}
            onChange={(event) => update("current_password", event.target.value)}
            disabled={saving}
          />
          {errors.current_password?.[0] && (
            <p className="mt-1 text-xs text-red-600">
              {errors.current_password[0]}
            </p>
          )}
        </div>

        <div>
          <PasswordField
            label="New Password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            disabled={saving}
          />
          {newPasswordError && (
            <p className="mt-1 text-xs text-red-600">{newPasswordError}</p>
          )}
        </div>

        <div>
          <PasswordField
            label="Confirm New Password"
            placeholder="Repeat new password"
            value={form.password_confirmation}
            onChange={(event) =>
              update("password_confirmation", event.target.value)
            }
            disabled={saving}
          />
          {confirmationError && (
            <p className="mt-1 text-xs text-red-600">{confirmationError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#8B1C1C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}
