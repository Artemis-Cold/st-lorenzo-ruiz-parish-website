import { format } from "date-fns";
import type { Dispatch, SetStateAction } from "react";
import {
  Gift,
  HeartHandshake,
  Cake,
  CalendarHeart,
  HandHelping,
  Cross,
  Circle,
  CircleCheckBig,
} from "lucide-react";

import { BookingCard } from "../..";

import type {
  MassIntentionBooking,
  IntentionType,
} from "../../../../types/mass";

interface Props {
  booking: MassIntentionBooking;
  setBooking: Dispatch<SetStateAction<MassIntentionBooking>>;
  errors?: Record<string, string[]>;
}

const intentionOptions = [
  {
    type: "Special Intention",
    icon: HeartHandshake,
    color: "text-red-500",
  },
  {
    type: "Thanksgiving",
    icon: Gift,
    color: "text-orange-500",
  },
  {
    type: "Birthday",
    icon: Cake,
    color: "text-pink-500",
  },
  {
    type: "Anniversary",
    icon: CalendarHeart,
    color: "text-rose-500",
  },
  {
    type: "Petition",
    icon: HandHelping,
    color: "text-blue-500",
  },
  {
    type: "Soul",
    icon: Cross,
    color: "text-gray-600",
  },
] satisfies {
  type: IntentionType;
  icon: React.ElementType;
  color: string;
}[];

export default function IntentionSelector({
  booking,
  setBooking,
  errors,
}: Props) {
  const toggleIntention = (type: IntentionType) => {
    setBooking((prev) => {
      const exists = prev.groups.some(
        (group) => group.type === type,
      );

      if (exists) {
        return {
          ...prev,
          groups: prev.groups.filter(
            (group) => group.type !== type,
          ),
        };
      }

      return {
        ...prev,
        groups: [
          ...prev.groups,
          {
            type,
            entries: [
              {
                id: Date.now(),
                names: [],
              },
            ],
          },
        ],
      };
    });
  };

  return (
    <BookingCard title="Mass Intentions">
      <div className="space-y-5">
        {/* Selected Date */}
        <div className="border-b pb-4">
          <h2 className="font-semibold uppercase tracking-wide text-[#B22222]">
            {booking.intention_date
              ? format(booking.intention_date, "MMMM yyyy")
              : "Select Date"}
          </h2>

          <p className="text-sm text-gray-500">
            {booking.intention_date
              ? format(booking.intention_date, "EEEE, MMMM d, yyyy")
              : "No date selected"}
          </p>
        </div>

        {/* Intention Types */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">
            Select Intention Type(s)
          </h3>

          <div className="space-y-2">
            {intentionOptions.map((item) => {
              const selected = booking.groups.some(
                (group) => group.type === item.type,
              );

              const Icon = item.icon;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => toggleIntention(item.type)}
                  className={`
                    flex w-full items-center justify-between
                    rounded-xl border p-4 transition
                    ${
                      selected
                        ? "border-[#B22222] bg-red-50"
                        : "border-gray-200 hover:border-[#B22222] hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg bg-red-50 p-2 ${item.color}`}
                    >
                      <Icon size={20} />
                    </div>

                    <span
                      className={`font-medium ${
                        selected ? "text-[#B22222]" : ""
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  {selected ? (
                    <CircleCheckBig
                      size={22}
                      className="text-[#B22222]"
                    />
                  ) : (
                    <Circle
                      size={22}
                      className="text-gray-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
          {errors?.groups?.[0] && (
            <p className="mt-2 text-sm text-red-600">{errors.groups[0]}</p>
          )}
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-[#B22222]">
            You may select <strong>multiple intention types</strong>.
            Each selected intention will have its own list of names in the
            next step.
          </p>
        </div>
      </div>
    </BookingCard>
  );
}
