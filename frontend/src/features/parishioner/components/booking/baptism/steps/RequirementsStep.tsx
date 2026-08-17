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
          {["Birth Certificate of the child to be baptized"].map((item) => (
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
          <div className="space-y-8">
            <div className="rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#B22222]">Baptism Permit</h4>

              <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
                <li>For those who are not under the parish jurisdiction.</li>
                <li>This can be obtained from your parish of origin.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#B22222]">
                Certificate of No Record of Baptism
              </h4>

              <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
                <li>For adult baptism (7 years old and above).</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#B22222]">
                Marriage Contract or Confirmation Certificate
              </h4>

              <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
                <li>For godparents (ninong and ninang).</li>
                <li>(Marriage contract if married in the church)</li>
                <li>(Confirmation certificate if now married in the church)</li>
              </ul>
            </div>

            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
              <p className="font-semibold text-yellow-800">
                NOTE:
              </p>

              <p className="mt-2 text-sm text-yellow-700">
                If the child to be baptized is 0–11 years old, the seminar is half-day only, and those required to attend are both parents and the godparents.
              </p>

              <p className="mt-2 text-sm text-yellow-700">
                If the child to be baptized is 12 years old and above, the seminar lasts for 2 full days, and those required to attend are both parents and the godparents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BookingCard>
  );
}
