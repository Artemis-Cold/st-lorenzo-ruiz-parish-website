import { Mail, MapPin, Phone, User } from "lucide-react";

import { BookingCard } from "../booking";

interface PersonalInformationProps {
  fullName?: string;
  phone?: string;
  username?: string;
  address?: string;
  onEdit?: () => void;
}

export default function PersonalInformation({
  fullName = "Juan Dela Cruz",
  phone = "0912 345 6789",
  username,
  address = "Dagatan, Taysan, Batangas",
  onEdit,
}: PersonalInformationProps) {
  const rows = [
    {
      icon: User,
      label: "Full Name",
      value: fullName,
    },
    {
      icon: Phone,
      label: "Contact Number",
      value: phone,
    },
    {
      icon: Mail,
      label: "Username",
      value: username,
    },
    {
      icon: MapPin,
      label: "Address",
      value: address,
    },
  ];

  return (
    <BookingCard title="Personal Information">
      <div className="space-y-4">
        {rows.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-xl border border-gray-100 p-4"
            >
              <div className="rounded-lg bg-red-50 p-3">
                <Icon
                  size={18}
                  className="text-[#B22222]"
                />
              </div>

              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {item.label}
                </p>

                <p className="mt-1 font-medium">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}

        <button
          onClick={onEdit}
          className="w-full rounded-xl border border-[#B22222] py-3 font-medium text-[#B22222] transition hover:bg-[#B22222] hover:text-white"
        >
          Edit Information
        </button>
      </div>
    </BookingCard>
  );
}
