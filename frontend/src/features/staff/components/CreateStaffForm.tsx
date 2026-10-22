import { useState } from "react";
import { AxiosError } from "axios";
import type { User } from "@/types/user";
import { createStaffAccount } from "@/services/staffSettingsService";
import PermissionChecklist from "./PermissionChecklist";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/alert-dialog";

const emptyStaff = {
  username: "",
  first_name: "",
  middle_initial: "",
  last_name: "",
  phone: "",
  password: "",
  password_confirmation: "",
};
const fields = [
  ["first_name", "First name", "e.g. Maria"],
  ["middle_initial", "Middle initial (optional)", "e.g. C"],
  ["last_name", "Last name", "e.g. Santos"],
  ["username", "Username", "Choose a unique username"],
  ["phone", "Mobile number", "09XXXXXXXXX"],
  ["password", "Password", "At least 8 characters"],
  ["password_confirmation", "Confirm password", "Re-enter the password"],
] as const;

export default function CreateStaffForm({
  onCreated,
  onCancel,
}: {
  onCreated: (user: User) => void;
  onCancel: () => void;
}) {
  const [details, setDetails] = useState(emptyStaff);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<"create" | "discard" | null>(null);
  async function create() {
    if (saving) return;
    setSaving(true);
    setErrors({});
    setMessage("");
    try {
      const account = await createStaffAccount({ ...details, permissions });
      onCreated(account);
    } catch (error) {
      setConfirm(null);
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
        setMessage("Please check the highlighted fields and try again.");
      } else setMessage("We couldn't create this account. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="rounded-3xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
      <h2 className="font-serif text-xl font-bold text-[#292524]">
        Add parish staff
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Enter their account details and choose the areas they can access.
      </p>
      <form
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setConfirm("create");
        }}
      >
        {message && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
          >
            {message}
          </p>
        )}
        <fieldset disabled={saving} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label, placeholder]) => (
              <label
                key={key}
                className="block text-sm font-medium text-[#292524]"
              >
                {label}
                <input
                  required={key !== "middle_initial"}
                  type={
                    key.includes("password")
                      ? "password"
                      : key === "phone"
                        ? "tel"
                        : "text"
                  }
                  autoComplete={
                    key.includes("password") ? "new-password" : "off"
                  }
                  minLength={key === "password" ? 8 : undefined}
                  maxLength={
                    key === "middle_initial"
                      ? 1
                      : key === "phone"
                        ? 11
                        : key.includes("password")
                          ? undefined
                          : 100
                  }
                  pattern={key === "phone" ? "09[0-9]{9}" : undefined}
                  aria-invalid={!!errors[key]}
                  aria-describedby={
                    errors[key] ? `staff-create-${key}-error` : undefined
                  }
                  value={details[key]}
                  placeholder={placeholder}
                  onChange={(event) =>
                    setDetails((current) => ({
                      ...current,
                      [key]:
                        key === "middle_initial"
                          ? event.target.value.toUpperCase()
                          : event.target.value,
                    }))
                  }
                  className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#B22222] ${errors[key] ? "border-red-400" : "border-[#E7E2DA]"}`}
                />
                {errors[key] && (
                  <span
                    id={`staff-create-${key}-error`}
                    className="mt-1 block text-xs text-red-700"
                  >
                    {errors[key][0]}
                  </span>
                )}
              </label>
            ))}
          </div>
          <PermissionChecklist value={permissions} onChange={setPermissions} />
          {errors.permissions && (
            <p role="alert" className="text-sm text-red-700">
              {errors.permissions[0]}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 border-t border-[#E7E2DA] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                if (Object.values(details).some(Boolean) || permissions.length)
                  setConfirm("discard");
                else onCancel();
              }}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#B22222] px-5 py-3 text-sm font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create staff account"}
            </button>
          </div>
        </fieldset>
      </form>
      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setConfirm(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border border-[#E7E2DA] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl font-bold text-[#292524]">
              {confirm === "discard"
                ? "Discard this account draft?"
                : "Create staff account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "discard"
                ? "The details you entered won't be saved."
                : `Create an account for ${details.first_name} ${details.last_name} with ${permissions.length} permissions selected?${permissions.length === 0 ? " They won't be able to open any management pages until you assign access." : ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              className="bg-[#B22222] text-white hover:bg-[#991B1B]"
              onClick={(event) => {
                event.preventDefault();
                if (confirm === "discard") onCancel();
                else void create();
              }}
            >
              {saving
                ? "Creating…"
                : confirm === "discard"
                  ? "Discard draft"
                  : "Create account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
