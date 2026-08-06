import {
  Clock3,
  Mail,
  Phone,
  CircleHelp,
} from "lucide-react";

import { BookingCard } from "../booking";

export default function HelpCard() {
  return (
    <BookingCard title="Need Help?">
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-5">
            <CircleHelp
              size={48}
              className="text-[#B22222]"
            />
          </div>
        </div>

        <p className="text-center text-sm leading-relaxed text-gray-600">
          Need assistance with your booking or requested
          documents? Contact the parish office using the
          information below.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
            <Phone
              size={18}
              className="text-[#B22222]"
            />

            <div>
              <p className="text-xs uppercase text-gray-400">
                Contact Number
              </p>

              <p className="font-medium">
                (043) 123-4567
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
            <Mail
              size={18}
              className="text-[#B22222]"
            />

            <div>
              <p className="text-xs uppercase text-gray-400">
                Email
              </p>

              <p className="font-medium">
                parish@email.com
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
            <Clock3
              size={18}
              className="text-[#B22222]"
            />

            <div>
              <p className="text-xs uppercase text-gray-400">
                Office Hours
              </p>

              <p className="font-medium">
                Monday – Saturday
              </p>

              <p className="text-sm text-gray-500">
                8:00 AM – 5:00 PM
              </p>
            </div>
          </div>
        </div>

        <button className="w-full rounded-xl bg-[#B22222] py-3 font-medium text-white transition hover:bg-[#991B1B]">
          Contact Parish Office
        </button>
      </div>
    </BookingCard>
  );
}