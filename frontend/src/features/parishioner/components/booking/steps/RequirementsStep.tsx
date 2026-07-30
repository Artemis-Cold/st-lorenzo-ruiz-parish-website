import { BookingCard } from "..";

export default function RequirementsStep() {
  return (
    <BookingCard title="Requirements">
      <div className="space-y-6">
        <p className="text-gray-600">
          Please prepare the following requirements before proceeding with your
          booking request.
        </p>

        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
          <p className="font-semibold text-yellow-800">Important Reminder</p>

          <p className="mt-2 text-sm text-yellow-700">
            All documents must be clear, complete, and valid. Incomplete
            submissions may delay the approval of your booking.
          </p>
        </div>

        <div className="space-y-3">
          {[
            "Marriage License (From City Hall - Civil Registrar)",
            "Certificate of No Marriage (CENOMAR)",
            "Baptismal Certificate (Marriage Purpose)",
            "Confirmation Certificate (Marriage Purpose)",
          ].map((item) => (
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
              <h4 className="font-semibold text-[#B22222]">
                Para sa mga Walang Binyag/Kumpil
              </h4>

              <p className="mt-2 text-gray-600">
                Ihanda ang mga requirements para sa binyag/kumpil.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
                <li>Interview / Canonical Investigation</li>
                <li>Four Pillars Pre-Cana Seminar</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#B22222]">
                Permission of Parish & Publication of Banns
              </h4>

              <p className="mt-2 text-gray-700">
                Kapag galing sa ibang parokya ang ikakasal (ibibigay ng opisina
                kapag natapos ang interview)/ Canonical Investigation
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#B22222]">Confession</h4>

              <p className="mt-2 text-gray-700">
                Both the bride and groom are encouraged to receive the Sacrament
                of Reconciliation before the wedding day.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#B22222]">Couple's Photo</h4>

              <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
                <li>Three (3) copies of 3R-sized photo</li>
                <li>Portrait orientation</li>
                <li>Both bride and groom must appear together</li>
                <li>
                  Indicate the couple's names, wedding address, wedding date,
                  day, and time.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#B22222]">
                For Principal Sponsors
              </h4>

              <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
                <li>Marriage Contract, or</li>
                <li>Confirmation Certificate (if unmarried in church)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BookingCard>
  );
}
