import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import {
  LockKeyhole,
  Settings as SettingsIcon,
  UserPlus,
  UserRound,
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

export default function Settings() {
  const { user, refreshUser } = useAuth();
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
    setProfileErrors({});
    try {
      await updateStaffProfile(profile);
      await refreshUser();
      toast.success("Profile updated.");
    } catch (error) {
      const errors = validationErrors(error);
      if (errors) setProfileErrors(errors);
      else toast.error("Unable to update profile. Please try again.");
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordErrors({});
    try {
      await updateStaffPassword(password);
      setPassword({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      toast.success("Password updated.");
    } catch (error) {
      const errors = validationErrors(error);
      if (errors) setPasswordErrors(errors);
      else toast.error("Unable to update password. Please try again.");
    }
  };

  const addStaff = async (event: FormEvent) => {
    event.preventDefault();
    setStaffErrors({});
    try {
      await createStaffAccount(newStaff);
      setNewStaff(emptyStaff);
      toast.success("Parish staff account created.");
    } catch (error) {
      const errors = validationErrors(error);
      if (errors) setStaffErrors(errors);
      else toast.error("Unable to create the staff account. Please try again.");
    }
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
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={saveProfile}
            noValidate
            className="space-y-4 rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-xl bg-red-50 p-2.5 text-[#B22222]">
                <UserRound size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Profile Information
                </h2>
                <p className="text-xs text-gray-500">
                  Details shown across the staff portal.
                </p>
              </div>
            </div>
            {Object.entries(profile).map(([key, value]) => (
              <label key={key} className="block text-sm font-medium capitalize">
                {key.replaceAll("_", " ")}
                <input
                  value={value}
                  maxLength={key === "middle_initial" ? 1 : undefined}
                  placeholder={`Enter ${key.replaceAll("_", " ")}`}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      [key]:
                        key === "middle_initial"
                          ? event.target.value.toUpperCase()
                          : event.target.value,
                    }))
                  }
                  className={`${inputClass(Boolean(profileErrors[key]))} mt-2`}
                />
                <ErrorText errors={profileErrors} name={key} />
              </label>
            ))}
            <button className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white">
              Save Profile
            </button>
          </form>

          <form
            onSubmit={savePassword}
            noValidate
            className="space-y-4 rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                <LockKeyhole size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Password & Security
                </h2>
                <p className="text-xs text-gray-500">
                  Use at least eight characters.
                </p>
              </div>
            </div>
            {(
              [
                ["current_password", "Current password"],
                ["password", "New password"],
                ["password_confirmation", "Confirm new password"],
              ] as const
            ).map(([key, placeholder]) => (
              <label key={key} className="block">
                <input
                  type="password"
                  aria-label={placeholder}
                  placeholder={placeholder}
                  value={password[key]}
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className={inputClass(Boolean(passwordErrors[key]))}
                />
                <ErrorText errors={passwordErrors} name={key} />
              </label>
            ))}
            <button className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white">
              Update Password
            </button>
          </form>

          <form
            onSubmit={addStaff}
            noValidate
            className="space-y-4 rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm lg:col-span-2"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Add Parish Staff
                </h2>
                <p className="text-xs text-gray-500">
                  Create a new parish staff account.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(newStaff).map(([key, value]) => (
                <label
                  key={key}
                  className="block text-sm font-medium capitalize"
                >
                  {key.replaceAll("_", " ")}
                  <input
                    type={key.includes("password") ? "password" : "text"}
                    value={value}
                    placeholder={`Enter ${key.replaceAll("_", " ")}`}
                    maxLength={key === "middle_initial" ? 1 : undefined}
                    onChange={(event) =>
                      setNewStaff((current) => ({
                        ...current,
                        [key]:
                          key === "middle_initial"
                            ? event.target.value.toUpperCase()
                            : event.target.value,
                      }))
                    }
                    className={`${inputClass(Boolean(staffErrors[key]))} mt-2`}
                  />
                  <ErrorText errors={staffErrors} name={key} />
                </label>
              ))}
            </div>
            <button className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white">
              Create Staff Account
            </button>
          </form>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
