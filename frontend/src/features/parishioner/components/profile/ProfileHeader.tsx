import {
  UserCircle2,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Camera,
  KeyRound,
  ContactRound,
} from "lucide-react";

interface ProfileHeaderProps {
  fullName: string;
  phone: string;
  username: string;
  address: string;
  avatar?: string;
  onEdit?: () => void;
  onChangePhoto?: () => void;
  onViewInformation?: () => void;
  onChangePassword?: () => void;
  activeTab: "current" | "recent" | "documents";
  onTabChange: (tab: "current" | "recent" | "documents") => void;
}

export default function ProfileHeader({
  fullName = "Juan Dela Cruz",
  phone = "0912 345 6789",
  username,
  address = "Dagatan, Taysan, Batangas",
  avatar,
  onEdit,
  onChangePhoto,
  onViewInformation,
  onChangePassword,
  activeTab,
  onTabChange,
}: ProfileHeaderProps) {
  const tabs = [
    { id: "current" as const, label: "Current Bookings" },
    { id: "recent" as const, label: "Recent Bookings" },
    { id: "documents" as const, label: "Documents" },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* Red Header */}
      <div className="bg-[#C32020] px-10 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="relative mx-auto flex-shrink-0 md:mx-0">
            {avatar ? (
              <img
                src={avatar}
                alt={fullName}
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white/10">
                <UserCircle2
                  size={96}
                  className="text-white"
                />
              </div>
            )}
            <button
              type="button"
              onClick={onChangePhoto}
              aria-label="Change profile photo"
              className="absolute bottom-1 right-1 grid size-11 place-items-center rounded-full border-2 border-white bg-white text-[#B22222] shadow-lg transition hover:scale-105 hover:bg-red-50"
            >
              <Camera size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1 text-center text-white md:text-left">
            <h1 className="break-words text-3xl font-bold sm:text-4xl">
              {fullName}
            </h1>

            <div className="mt-3 space-y-2 text-left text-white/90">
              <div className="flex items-start gap-2">
                <Phone size={18} />
                <span>{phone}</span>
              </div>

              <div className="flex items-start gap-2">
                <Mail size={18} />
                <span>@{username}</span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={18} />
                <span className="break-words">{address}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <button
                type="button"
                onClick={onViewInformation}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-[#B22222] transition hover:bg-red-50"
              >
                <ContactRound size={18} />
                Personal Information
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-white px-5 py-2.5 font-medium text-white transition hover:bg-white hover:text-[#B22222]"
              >
                <Pencil size={18} />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={onChangePassword}
                className="inline-flex items-center gap-2 rounded-xl border border-white px-5 py-2.5 font-medium text-white transition hover:bg-white hover:text-[#B22222]"
              >
                <KeyRound size={18} />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-3 border-t bg-white text-center">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`py-5 text-sm font-semibold transition sm:text-lg ${
              index < tabs.length - 1 ? "border-r" : ""
            } ${
              activeTab === tab.id
                ? "bg-red-50 text-[#B22222] shadow-[inset_0_-3px_0_#B22222]"
                : "hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
