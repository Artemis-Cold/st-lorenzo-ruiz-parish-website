import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { BookingCard } from "../booking";
import {
  updateProfile,
  updateProfilePhoto,
  type UpdateProfileData,
} from "@/api/auth";
import type { User } from "@/types/user";

interface Props {
  user: User;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}

export default function ProfileEditForm({ user, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<UpdateProfileData>({
    first_name: user.first_name,
    middle_initial: user.middle_initial ?? "",
    last_name: user.last_name,
    suffix: user.suffix ?? "",
    phone: user.phone,
    birth_date: user.birth_date?.slice(0, 10) ?? "",
    gender: user.gender === "Female" ? "Female" : "Male",
    house_no: user.address.house_no ?? "",
    street: user.address.street ?? "",
    barangay: user.address.barangay ?? "",
    municipality: user.address.municipality ?? "",
    province: user.address.province ?? "",
    zip_code: user.address.zip_code ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const update = <K extends keyof UpdateProfileData>(
    field: K,
    value: UpdateProfileData[K],
  ) => setForm((previous) => ({ ...previous, [field]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await updateProfile({
        ...form,
        phone: form.phone.replace(/\s+/g, ""),
      });
      if (photo) {
        await updateProfilePhoto(photo);
      }
      toast.success(response.message);
      await onSaved();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        toast.error("Unable to update your profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (
    key: keyof UpdateProfileData,
    label: string,
    options?: { type?: string; required?: boolean; maxLength?: number },
  ) => (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {options?.required !== false && (
          <span className="text-red-600"> *</span>
        )}
      </label>
      <input
        type={options?.type ?? "text"}
        maxLength={options?.maxLength}
        value={form[key]}
        onChange={(event) =>
          update(key, event.target.value as UpdateProfileData[typeof key])
        }
        className={
          "w-full rounded-xl border px-4 py-3 outline-none " +
          (errors[key]
            ? "border-red-400 focus:border-red-500"
            : "border-gray-300 focus:border-[#B22222]")
        }
      />
      {errors[key]?.[0] && (
        <p className="mt-1 text-sm text-red-600">{errors[key][0]}</p>
      )}
    </div>
  );

  return (
    <BookingCard title="Edit Personal Information">
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Profile Photo
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG, or WebP; maximum 2 MB.
          </p>
          {errors.profile_photo?.[0] && (
            <p className="mt-1 text-sm text-red-600">
              {errors.profile_photo[0]}
            </p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {field("first_name", "First Name")}
          {field("middle_initial", "Middle Initial", {
            required: false,
            maxLength: 1,
          })}
          {field("last_name", "Last Name")}
          {field("suffix", "Suffix", { required: false })}
          {field("phone", "Contact Number")}
          {field("birth_date", "Birth Date", { type: "date" })}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Gender <span className="text-red-600">*</span>
          </label>
          <select
            value={form.gender}
            onChange={(event) =>
              update("gender", event.target.value as "Male" | "Female")
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#B22222]"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender?.[0] && (
            <p className="mt-1 text-sm text-red-600">{errors.gender[0]}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {field("house_no", "House Number", { required: false })}
          {field("street", "Street", { required: false })}
          {field("barangay", "Barangay")}
          {field("municipality", "Municipality/City")}
          {field("province", "Province")}
          {field("zip_code", "ZIP Code", { required: false })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-5 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#B22222] px-5 py-3 text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </BookingCard>
  );
}
