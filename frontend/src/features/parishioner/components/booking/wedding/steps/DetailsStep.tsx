import { BookingCard } from "../..";
import type { WeddingBooking } from "../../../../types/wedding";
import type { Dispatch, SetStateAction } from "react";
import type { Person } from "../../../../types/person";

interface DetailsStepProps {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
}

export default function DetailsStep({ booking, setBooking }: DetailsStepProps) {
  const updateGroom = <K extends keyof Person>(field: K, value: Person[K]) => {
    setBooking((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        groom: {
          ...prev.applicant.groom,
          [field]: value,
        },
      },
    }));
  };

  return (
    <>
      <BookingCard title="Groom's Information">
        <form className="space-y-8">
          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Personal Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.groom.lastName}
                  onChange={(e) => updateGroom("lastName", e.target.value)}
                  placeholder="Enter last name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.groom.firstName}
                  onChange={(e) => updateGroom("firstName", e.target.value)}
                  placeholder="Enter first name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  value={booking.applicant.groom.middleInitial}
                  onChange={(e) => updateGroom("middleInitial", e.target.value)}
                  placeholder="M"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.groom.address}
                  onChange={(e) => updateGroom("address", e.target.value)}
                  placeholder="Street, Barangay, Municipality/City"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="mb-2 block text-sm font-medium">
                  Age <span className="text-red-600">*</span>
                </label>

                <input
                  type="number"
                  value={booking.applicant.groom.age ?? ""}
                  onChange={(e) =>
                    updateGroom(
                      "age",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="00"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-9">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  value={booking.applicant.groom.contactNumber}
                  onChange={(e) => updateGroom("contactNumber", e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Church Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Baptized In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Confirmed In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Background Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's last name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's first name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Father's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Reminder:</strong> Please enter the groom's mother's
                  maiden name (surname before marriage).
                </p>
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's last name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's first name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Mother's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              In Your Address
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Church Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Parish Priest <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish Priest"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Church Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Street, Barangay, Municipality/City"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Bride's Information">
        <form className="space-y-8">
          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Personal Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter last name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter first name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Street, Barangay, Municipality/City"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="mb-2 block text-sm font-medium">
                  Age <span className="text-red-600">*</span>
                </label>

                <input
                  type="number"
                  placeholder="00"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-9">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Church Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Baptized In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Confirmed In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Background Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's last name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's first name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Father's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Reminder:</strong> Please enter the bride's mother's
                  maiden name (surname before marriage).
                </p>
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's last name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's first name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Mother's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              In Your Address
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Church Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Parish Priest <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish Priest"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Church Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Street, Barangay, Municipality/City"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Requirements">
        <form className="space-y-8">
          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Attach Soft Copy of Requirements
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Baptized In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Confirmed In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#B22222] focus:outline-none"
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>
    </>
  );
}
