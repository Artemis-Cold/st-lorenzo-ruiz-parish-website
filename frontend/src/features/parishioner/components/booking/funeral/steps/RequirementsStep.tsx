import { BookingCard } from "../..";

export default function RequirementsStep() {
  return (
    <BookingCard title="Requirements">
      <div className="space-y-6">
        <p className="text-gray-600">
          Prepare the following requirements. You may submit unavailable files
          later while your booking remains pending.
        </p>

        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
          <p className="font-semibold text-yellow-800">Important Reminder</p>

          <p className="mt-2 text-sm text-yellow-700">
            Incomplete bookings can be submitted, but cannot be approved until
            all requirements are uploaded. You will receive an SMS reminder.
          </p>
        </div>

        <div className="space-y-3">
          {["Death Certificate"].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B22222] font-semibold text-white">
                ✓
              </span>

              <span className="font-medium text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-8">
          <h3 className="mb-6 text-center text-2xl font-bold uppercase text-[#B22222]">
            Additional Requirements
          </h3>

          <div className="rounded-xl border border-gray-200 p-5">
            <h4 className="font-semibold text-[#B22222]">
              Memorial Biography
            </h4>

            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>A written life story honoring your loved ones.</li>
            </ul>
          </div>
        </div>
      </div>
    </BookingCard>
  );
}
