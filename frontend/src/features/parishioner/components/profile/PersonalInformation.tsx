import { BadgeCheck, CalendarDays, ContactRound, Mail, MapPin, Phone, UserRound } from "lucide-react";

import type { User } from "@/types/user";
import ProfileModal from "./ProfileModal";

interface PersonalInformationProps {
  user: User;
  address: string;
  onClose: () => void;
  onEdit: () => void;
}

export default function PersonalInformation({
  user,
  address,
  onClose,
  onEdit,
}: PersonalInformationProps) {
  const rows = [
    {
      icon: UserRound,
      label: "Full Name",
      value: user.full_name,
    },
    {
      icon: ContactRound,
      label: "Parishioner ID",
      value: user.parishioner_id,
    },
    {
      icon: Phone,
      label: "Contact Number",
      value: user.phone,
    },
    {
      icon: Mail,
      label: "Username",
      value: `@${user.username}`,
    },
    {
      icon: CalendarDays,
      label: "Birth Date",
      value: user.birth_date
        ? new Date(`${user.birth_date.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Not provided",
    },
    {
      icon: UserRound,
      label: "Gender",
      value: user.gender || "Not provided",
    },
    {
      icon: MapPin,
      label: "Address",
      value: address,
    },
    {
      icon: BadgeCheck,
      label: "Phone Verification",
      value: user.phone_verified ? "Verified" : "Not verified",
    },
  ];

  return (
    <ProfileModal
      title="Personal Information"
      description="Review the information saved in your parish account."
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-xl border border-gray-100 p-4"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <Icon
                  size={18}
                  className="text-[#B22222]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {item.label}
                </p>

                <p className="mt-1 break-words font-medium">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}

      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50">Close</button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#991B1B]"
        >
          Edit Information
        </button>
      </div>
    </ProfileModal>
  );
}
