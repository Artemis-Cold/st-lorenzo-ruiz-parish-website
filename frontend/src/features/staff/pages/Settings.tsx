import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AxiosError } from "axios";
import {
  LockKeyhole,
  Settings as SettingsIcon,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import {
  createStaffAccount,
  updateStaffPassword,
  updateStaffProfile,
} from "@/services/staffSettingsService";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

type FieldErrors = Record<string, string[]>;

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 outline-none ${hasError ? "border-red-400 focus:border-red-500" : "border-[#E7E2DA] focus:border-[#B22222]"}`;

const validationErrors = (error: unknown): FieldErrors | null =>
  error instanceof AxiosError && error.response?.status === 422
    ? (error.response.data.errors as FieldErrors)
    : null;

function ErrorText({ errors, name }: { errors: FieldErrors; name: string }) {
  return errors[name]?.[0] ? (
    <p className="mt-1 text-xs text-red-600">{errors[name][0]}</p>
  ) : null;
}

function SettingsModal({
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-settings-modal-title"
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-xl"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
          <div>
            <h2 id="staff-settings-modal-title" className="font-serif text-2xl font-bold text-[#292524]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="ml-4 grid size-10 shrink-0 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
            <X size={20} />
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
      </section>
    </div>
  );
}

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeModal, setActiveModal] = useState<
    "profile" | "password" | "staff" | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: user?.username ?? "",
    first_name: user?.first_name ?? "",
    middle_initial: user?.middle_initial ?? "",
    last_name: user?.last_name ?? "",
    suffix: user?.suffix ?? "",
    phone: user?.phone ?? "",
  });
  const [password, setPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const emptyStaff = {
    username: "",
    first_name: "",
    middle_initial: "",
    last_name: "",
    phone: "",
    password: "",
    password_confirmation: "",
  };
  const [newStaff, setNewStaff] = useState(emptyStaff);
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [staffErrors, setStaffErrors] = useState<FieldErrors>({});

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setProfileErrors({});
    try {
      await updateStaffProfile(profile);
      await refreshUser();
      toast.success("Profile updated.");
      setActiveModal(null);
    } catch (error) {
      const errors = validationErrors(error);
      if (errors) setProfileErrors(errors);
      else toast.error("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setPasswordErrors({});
    try {
      await updateStaffPassword(password);
      setPassword({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      toast.success("Password updated.");
      setActiveModal(null);
    } catch (error) {
      const errors = validationErrors(error);
      if (errors) setPasswordErrors(errors);
      else toast.error("Unable to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addStaff = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStaffErrors({});
    try {
      await createStaffAccount(newStaff);
      setNewStaff(emptyStaff);
      toast.success("Parish staff account created.");
      setActiveModal(null);
    } catch (error) {
      const errors = validationErrors(error);
      if (errors) setStaffErrors(errors);
      else toast.error("Unable to create the staff account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openModal = (modal: "profile" | "password" | "staff") => {
    setProfileErrors({});
    setPasswordErrors({});
    setStaffErrors({});
    setActiveModal(modal);
  };

  const closeModal = () => {
    if (!saving) setActiveModal(null);
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#B22222] to-[#741515] px-8 py-9 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <SettingsIcon />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F5D76E]">
                Account administration
              </p>
              <h1 className="mt-1 font-serif text-3xl font-bold">Settings</h1>
              <p className="mt-1 text-sm text-white/75">
                Manage your profile, security, and parish staff access.
              </p>
            </div>
          </div>
        </div>
        <section className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#292524]">Account Management</h2>
                <p className="mt-1 text-sm text-gray-500">Choose an option to manage parish staff access.</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <button type="button" onClick={() => openModal("profile")} className="group flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-[#FAF8F5] sm:px-8">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]"><UserRound size={22} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#292524]">Profile Information</p>
                <p className="mt-1 text-sm text-gray-500">Update your name, username, and contact details.</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#B22222]" />
            </button>

            <button type="button" onClick={() => openModal("password")} className="group flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-[#FAF8F5] sm:px-8">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><LockKeyhole size={22} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#292524]">Password &amp; Security</p>
                <p className="mt-1 text-sm text-gray-500">Change the password for your staff account.</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#B22222]" />
            </button>

            <button type="button" onClick={() => openModal("staff")} className="group flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-[#FAF8F5] sm:px-8">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><UserPlus size={22} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#292524]">Add Parish Staff</p>
                <p className="mt-1 text-sm text-gray-500">Create credentials for another authorized staff member.</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#B22222]" />
            </button>
          </div>
        </section>
      </div>

      {activeModal === "profile" && (
        <SettingsModal title="Edit Profile Information" description="Update the details shown across the staff portal." onClose={closeModal} wide>
          <form onSubmit={saveProfile} noValidate className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(profile).map(([key, value]) => (
                <label key={key} className="block text-sm font-medium capitalize">
                  {key.replaceAll("_", " ")}
                  <input value={value} maxLength={key === "middle_initial" ? 1 : undefined} placeholder={`Enter ${key.replaceAll("_", " ")}`} onChange={(event) => setProfile((current) => ({ ...current, [key]: key === "middle_initial" ? event.target.value.toUpperCase() : event.target.value }))} className={`${inputClass(Boolean(profileErrors[key]))} mt-2`} />
                  <ErrorText errors={profileErrors} name={key} />
                </label>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50">{saving ? "Saving..." : "Save Profile"}</button>
            </div>
          </form>
        </SettingsModal>
      )}

      {activeModal === "password" && (
        <SettingsModal title="Change Password" description="Use your current password to authorize this change." onClose={closeModal}>
          <form onSubmit={savePassword} noValidate className="space-y-4">
            {([ ["current_password", "Current password"], ["password", "New password"], ["password_confirmation", "Confirm new password"] ] as const).map(([key, placeholder]) => (
              <label key={key} className="block text-sm font-medium">
                {placeholder}
                <input type="password" placeholder={placeholder} value={password[key]} onChange={(event) => setPassword((current) => ({ ...current, [key]: event.target.value }))} className={`${inputClass(Boolean(passwordErrors[key]))} mt-2`} />
                <ErrorText errors={passwordErrors} name={key} />
              </label>
            ))}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50">{saving ? "Updating..." : "Update Password"}</button>
            </div>
          </form>
        </SettingsModal>
      )}

      {activeModal === "staff" && (
        <SettingsModal title="Add Parish Staff" description="Create a new account for an authorized parish staff member." onClose={closeModal} wide>
          <form onSubmit={addStaff} noValidate className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(newStaff).map(([key, value]) => (
                <label key={key} className="block text-sm font-medium capitalize">
                  {key.replaceAll("_", " ")}
                  <input type={key.includes("password") ? "password" : "text"} value={value} placeholder={`Enter ${key.replaceAll("_", " ")}`} maxLength={key === "middle_initial" ? 1 : undefined} onChange={(event) => setNewStaff((current) => ({ ...current, [key]: key === "middle_initial" ? event.target.value.toUpperCase() : event.target.value }))} className={`${inputClass(Boolean(staffErrors[key]))} mt-2`} />
                  <ErrorText errors={staffErrors} name={key} />
                </label>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50">{saving ? "Creating..." : "Create Staff Account"}</button>
            </div>
          </form>
        </SettingsModal>
      )}
    </StaffDashboardLayout>
  );
}
