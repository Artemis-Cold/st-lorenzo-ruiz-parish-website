import {
  UserCircle2,
  Phone,
  Mail,
  MapPin,
  Pencil,
} from "lucide-react";

interface ProfileHeaderProps {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  avatar?: string;
  onEdit?: () => void;
}

export default function ProfileHeader({
  fullName = "Juan Dela Cruz",
  phone = "0912 345 6789",
  email = "juan@email.com",
  address = "Dagatan, Taysan, Batangas",
  avatar,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* Red Header */}
      <div className="bg-[#C32020] px-10 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="flex-shrink-0">
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
          </div>

          {/* User Info */}
          <div className="flex-1 text-white">
            <h1 className="text-4xl font-bold">
              {fullName}
            </h1>

            <div className="mt-3 space-y-2 text-white/90">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>{phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>{email}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{address}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white px-6 py-2 font-medium text-white transition hover:bg-white hover:text-[#B22222]"
            >
              <Pencil size={18} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-3 border-t bg-white text-center">
        <button className="border-r py-5 text-lg font-semibold transition hover:bg-gray-50">
          Current Bookings
        </button>

        <button className="border-r py-5 text-lg font-semibold transition hover:bg-gray-50">
          Recent Bookings
        </button>

        <button className="py-5 text-lg font-semibold transition hover:bg-gray-50">
          Documents
        </button>
      </div>
    </div>
  );
}