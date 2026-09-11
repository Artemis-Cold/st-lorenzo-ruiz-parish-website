import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  KeyRound,
  Pencil,
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import PasswordSettingsCard from "../components/profile/PasswordSettingsCard";
import PhoneVerificationModal from "../components/profile/PhoneVerificationModal";
import { getProfile } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types/user";

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(
    () => searchParams.get("verifyPhone") === "1",
  );

  const reload = async () => {
    const response = await getProfile();
    setUser(response.user);
    await refreshUser();
  };

  useEffect(() => {
    getProfile().then((response) => setUser(response.user));
  }, []);

  const closeVerification = () => {
    setVerifyingPhone(false);
    const next = new URLSearchParams(searchParams);
    next.delete("verifyPhone");
    setSearchParams(next, { replace: true });
  };

  if (!user)
    return (
      <DashboardLayout>
        <p>Unable to load account settings.</p>
      </DashboardLayout>
    );

  const actions = [
    {
      title: "Edit Profile",
      description: "Update your personal details, address, or mobile number.",
      icon: Pencil,
      action: () => setEditing(true),
    },
    {
      title: "Change Password",
      description: "Keep your account secure with a new password.",
      icon: KeyRound,
      action: () => setChangingPassword(true),
    },
    {
      title: "Verify Phone Number",
      description: user.phone_verified
        ? `${user.phone} is verified.`
        : `Verify ${user.phone} to restore booking access.`,
      icon: user.phone_verified ? ShieldCheck : ShieldAlert,
      action: () => setVerifyingPhone(true),
      disabled: user.phone_verified,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-7 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-red-100 text-[#B22222]">
          <SettingsIcon />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">
            Manage your profile and account security.
          </p>
        </div>
      </div>

      {!user.phone_verified && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Your mobile number changed or is unverified. New bookings are disabled
          until you verify it again.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {actions.map(({ title, description, icon: Icon, action, disabled }) => (
          <section
            key={title}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <Icon
              className={disabled ? "text-emerald-600" : "text-[#B22222]"}
              size={28}
            />
            <h2 className="mt-4 text-lg font-bold">{title}</h2>
            <p className="mt-2 min-h-12 text-sm text-gray-600">{description}</p>
            <button
              type="button"
              onClick={action}
              disabled={disabled}
              className="mt-5 w-full rounded-xl bg-[#B22222] px-4 py-2.5 font-semibold text-white disabled:bg-emerald-100 disabled:text-emerald-800"
            >
              {disabled ? "Verified" : title}
            </button>
          </section>
        ))}
      </div>

      {editing && (
        <ProfileEditForm
          user={user}
          onCancel={() => setEditing(false)}
          onSaved={async () => {
            await reload();
            setEditing(false);
          }}
        />
      )}
      {changingPassword && (
        <PasswordSettingsCard onClose={() => setChangingPassword(false)} />
      )}
      {verifyingPhone && !user.phone_verified && (
        <PhoneVerificationModal
          phone={user.phone}
          username={user.username}
          onClose={closeVerification}
          onVerified={reload}
        />
      )}
    </DashboardLayout>
  );
}
