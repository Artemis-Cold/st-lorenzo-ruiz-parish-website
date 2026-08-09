import { useState, useEffect, type FormEvent } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { completeProfile } from "@/api/auth";

export default function CompleteProfileModal() {
  const { refreshUser } = useAuth();

  const [barangay, setBarangay] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [province, setProvince] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await completeProfile({
        barangay,
        municipality,
        province,
        house_no: houseNo || undefined,
        street: street || undefined,
        zip_code: zipCode || undefined,
        birth_date: birthDate,
        gender,
      });

      toast.success("Profile completed successfully!");

      await refreshUser();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 422) {
        setFieldErrors(err.response.data?.errors ?? {});
        setError("Please review the highlighted fields.");
      } else if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ??
            "Something went wrong. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="mb-2 font-serif text-2xl font-bold text-[#B22222]">
          Complete Your Profile
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          We need a few more details before you can book parish services.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Birthday
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
              />
              {fieldErrors.birth_date && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.birth_date[0]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {fieldErrors.gender && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.gender[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Barangay
            </label>
            <input
              type="text"
              placeholder="e.g. Barangay San Isidro"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
            />
            {fieldErrors.barangay && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.barangay[0]}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Municipality / City
            </label>
            <input
              type="text"
              placeholder="e.g. Caloocan City"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
            />
            {fieldErrors.municipality && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.municipality[0]}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Province
            </label>
            <input
              type="text"
              placeholder="e.g. Metro Manila"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
            />
            {fieldErrors.province && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.province[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                House No. (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 123"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
              />
              {fieldErrors.house_no && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.house_no[0]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Street (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Rizal St."
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
              />
              {fieldErrors.street && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.street[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Zip Code (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 1400"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
            />
            {fieldErrors.zip_code && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.zip_code[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#B22222] py-3 font-semibold text-white transition hover:bg-[#8B1C1C] disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save and Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
