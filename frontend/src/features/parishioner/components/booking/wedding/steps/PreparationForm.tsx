import { useEffect, useId, useState } from "react";
import FieldError from "../../FieldError";
import BookingLabel from "../../BookingLabel";
import type {
  SacramentPreparation,
  WeddingSponsor,
} from "../../../../types/wedding";
import { getServicePackages } from "@/services/servicePackageService";
import { getServiceFees } from "@/services/serviceFeeService";
import { formatPhpCurrency } from "@/utils/currency";

const fieldLabels: Record<string, string> = {
  first_name: "First Name",
  middle_initial: "MI",
  last_name: "Last Name",
  birth_date: "Birthday",
  birth_place: "Place of Birth",
  address: "Address",
  residence: "Address",
  contact_number: "Contact Number",
  parish_origin: "Parish of Origin",
  baptism_date: "Date of Baptism",
  baptism_church: "Baptized In",
};

export default function PreparationForm({
  code,
  value,
  onChange,
  awaitingBaptism,
  readOnly,
  errors,
  prefix,
}: {
  code: "baptism" | "confirmation";
  value: SacramentPreparation;
  onChange: (next: SacramentPreparation) => void;
  awaitingBaptism: boolean;
  readOnly: boolean;
  errors: Record<string, string[]>;
  prefix: string;
}) {
  const formId = useId();
  const [price, setPrice] = useState<number | null>(null);
  const [sponsorFee, setSponsorFee] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    getServicePackages(code)
      .then((packages) => {
        const selected = packages.sort(
          (a, b) =>
            Number(b.recommended) - Number(a.recommended) || a.id - b.id,
        )[0];
        if (active && selected)
          setPrice(
            selected.base_price +
              selected.inclusions.reduce((sum, item) => sum + item.price, 0),
          );
      })
      .catch(() => {
        if (active) setPrice(null);
      });
    if (code === "baptism")
      getServiceFees(code)
        .then((fees) => {
          if (active)
            setSponsorFee(
              fees.find((fee) => fee.code === "additional_sponsor")?.amount ??
                null,
            );
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [code]);
  const inputClass = `w-full rounded-xl border px-4 py-3 transition ${readOnly ? "border-gray-200 bg-gray-50 text-gray-700" : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"}`;
  const field = (
    key: string,
    label: string,
    current: string,
    update: (value: string) => void,
    type = "text",
  ) => (
    <div
      key={key}
      className={
        key.endsWith("middle_initial")
          ? "col-span-12 md:col-span-2"
          : key.endsWith("first_name") || key.endsWith("last_name")
            ? "col-span-12 md:col-span-5"
            : "col-span-12 md:col-span-6"
      }
    >
      <BookingLabel
        htmlFor={`${formId}-${key}`}
        className="mb-2 block text-sm font-medium"
      >
        {fieldLabels[key.split(".").at(-1) ?? ""] ?? label}
        {!key.endsWith("middle_initial") && (
          <span className="text-red-600"> *</span>
        )}
      </BookingLabel>
      <input
        id={`${formId}-${key}`}
        type={type}
        maxLength={key.endsWith("middle_initial") ? 1 : undefined}
        placeholder={
          type === "date"
            ? undefined
            : key.endsWith("middle_initial")
              ? "M"
              : key.endsWith("contact_number")
                ? "09XXXXXXXXX"
                : key.endsWith("address") || key.endsWith("residence")
                  ? "Street, Barangay, Municipality/City"
                  : `Enter ${label.split(" / ")[0].toLowerCase()}`
        }
        aria-invalid={!!errors[`${prefix}.${key}`]?.[0]}
        value={current ?? ""}
        readOnly={readOnly}
        onChange={(e) => update(e.target.value)}
        className={
          inputClass +
          (errors[`${prefix}.${key}`]?.[0] ? " border-red-400" : "")
        }
      />
      <FieldError message={errors[`${prefix}.${key}`]?.[0]} />
    </div>
  );
  const updateSponsor = (index: number, patch: Partial<WeddingSponsor>) =>
    onChange({
      ...value,
      sponsors: value.sponsors.map((sponsor, i) =>
        i === index ? { ...sponsor, ...patch } : sponsor,
      ),
    });
  return (
    <div className="space-y-5 rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] p-4">
      <p className="text-sm font-semibold text-[#B22222]">
        Additional {code} package:{" "}
        {price === null
          ? "Price unavailable — refresh before submitting"
          : formatPhpCurrency(price)}{" "}
        per person
      </p>
      {code === "baptism" && (
        <p className="text-xs text-gray-600">
          Includes Baptism Bib, Candle for 1 pair sponsor, Rite of Baptism (Ritu
          ng Binyag), and White Towel.{" "}
          {value.sponsors.length > 2 && (
            <>
              Additional sponsors:{" "}
              {sponsorFee === null
                ? "Price unavailable"
                : formatPhpCurrency((value.sponsors.length - 2) * sponsorFee)}
              .
            </>
          )}
        </p>
      )}
      <p className="text-xs text-gray-600">
        Separate booking and payment. Staff will send the priest-coordinated
        schedule by SMS; it is not automatically on the wedding date.
        <br />
        Hiwalay ang bayad at iskedyul. Magpapadala ang staff ng SMS ayon sa
        availability ng pari.
      </p>
      <div className="grid grid-cols-12 gap-5">
        {[
          ["first_name", "First name / Pangalan"],
          ["middle_initial", "Middle initial / Gitnang inisyal (optional)"],
          ["last_name", "Last name / Apelyido"],
          ["birth_date", "Birth date / Petsa ng kapanganakan", "date"],
          ["birth_place", "Birth place / Lugar ng kapanganakan"],
          ["address", "Address / Tirahan"],
          ["contact_number", "Contact number / Numero ng telepono"],
          ...(code === "confirmation"
            ? [
                ["parish_origin", "Parish of origin / Pinanggalingang parokya"],
                ...(!awaitingBaptism
                  ? [
                      [
                        "baptism_date",
                        "Baptism date / Petsa ng binyag",
                        "date",
                      ],
                      ["baptism_church", "Baptism church / Parokya ng binyag"],
                    ]
                  : []),
              ]
            : []),
        ].map(([key, label, type]) =>
          field(
            `candidate.${key}`,
            label,
            value.candidate[key],
            (input) =>
              onChange({
                ...value,
                candidate: { ...value.candidate, [key]: input },
              }),
            type,
          ),
        )}
      </div>
      <div className="text-sm">
        <BookingLabel
          htmlFor={`${formId}-gender`}
          className="mb-2 block text-sm font-medium"
        >
          Gender <span className="text-red-600">*</span>
        </BookingLabel>
        <select
          id={`${formId}-gender`}
          className={inputClass}
          disabled={readOnly}
          value={value.candidate.gender}
          onChange={(e) =>
            onChange({
              ...value,
              candidate: { ...value.candidate, gender: e.target.value },
            })
          }
        >
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>
      {value.parents.map((parent, index) => (
        <div key={parent.relationship} className="space-y-3">
          <h4 className="font-semibold">
            {parent.relationship === "father" ? "Father / Ama" : "Mother / Ina"}
          </h4>
          <div className="grid grid-cols-12 gap-5">
            {[
              ["first_name", "First name / Pangalan"],
              ["middle_initial", "Middle initial (optional)"],
              ["last_name", "Last name / Apelyido"],
              ["birth_place", "Birth place / Lugar ng kapanganakan"],
            ].map(([key, label]) =>
              field(
                `parents.${index}.${key}`,
                label,
                parent[key as keyof typeof parent],
                (input) =>
                  onChange({
                    ...value,
                    parents: value.parents.map((item, i) =>
                      i === index ? { ...item, [key]: input } : item,
                    ),
                  }),
              ),
            )}
          </div>
        </div>
      ))}
      <h4 className="font-semibold">Sponsors / Ninong at Ninang</h4>
      {value.sponsors.map((sponsor, index) => (
        <div key={index} className="space-y-3 rounded-xl border bg-white p-3">
          <p className="text-sm font-semibold">Sponsor {index + 1}</p>
          <BookingLabel
            htmlFor={`${formId}-role-${index}`}
            className="mb-2 block text-sm font-medium"
          >
            Sponsor Role <span className="text-red-600">*</span>
          </BookingLabel>
          <select
            id={`${formId}-role-${index}`}
            aria-label={`Sponsor ${index + 1} role`}
            disabled={readOnly}
            className={inputClass}
            value={sponsor.role}
            onChange={(e) =>
              updateSponsor(index, {
                role: e.target.value as WeddingSponsor["role"],
              })
            }
          >
            <option value="">Select role / Piliin</option>
            <option value="godfather">Godfather / Ninong</option>
            <option value="godmother">Godmother / Ninang</option>
          </select>
          <div className="grid grid-cols-12 gap-5">
            {[
              ["first_name", "First name / Pangalan"],
              ["middle_initial", "Middle initial (optional)"],
              ["last_name", "Last name / Apelyido"],
              ["residence", "Address / Tirahan"],
            ].map(([key, label]) =>
              field(
                `sponsors.${index}.${key}`,
                label,
                sponsor[key as "first_name"],
                (input) => updateSponsor(index, { [key]: input }),
              ),
            )}
          </div>
          <div className="text-sm">
            <BookingLabel
              htmlFor={`${formId}-requirement-${index}`}
              className="mb-2 block text-sm font-medium"
            >
              Certificate to submit <span className="text-red-600">*</span>
            </BookingLabel>
            <select
              id={`${formId}-requirement-${index}`}
              disabled={readOnly}
              className={inputClass}
              value={sponsor.requirement_type}
              onChange={(e) =>
                updateSponsor(index, {
                  requirement_type: e.target
                    .value as WeddingSponsor["requirement_type"],
                  requirement_file: null,
                })
              }
            >
              <option value="">Select requirement</option>
              <option value="marriage_contract">Marriage Contract</option>
              <option value="confirmation_certificate">
                Confirmation Certificate
              </option>
            </select>
          </div>

          {errors[`${prefix}.sponsors.${index}.requirement_file`]?.map(
            (error) => (
              <p key={error} className="text-xs text-red-600">
                {error}
              </p>
            ),
          )}
          {!readOnly &&
            value.sponsors.length > (code === "baptism" ? 2 : 1) && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    sponsors: value.sponsors.filter((_, i) => i !== index),
                  })
                }
                className="text-xs text-red-700"
              >
                Remove sponsor
              </button>
            )}
        </div>
      ))}
      {!readOnly && value.sponsors.length < (code === "baptism" ? 40 : 20) && (
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm text-[#B22222]"
          onClick={() =>
            onChange({
              ...value,
              sponsors: [
                ...value.sponsors,
                {
                  role: "",
                  first_name: "",
                  middle_initial: "",
                  last_name: "",
                  residence: "",
                  requirement_type: "",
                  requirement_file: null,
                },
              ],
            })
          }
        >
          Add sponsor / Magdagdag
        </button>
      )}
      <h4 className="font-semibold">Requirements / Mga dokumento</h4>
      {awaitingBaptism && code === "confirmation" && (
        <p className="text-xs text-amber-800">
          Baptism certificate and baptism details will follow after baptism. /
          Isusumite pagkatapos ng binyag.
        </p>
      )}
      <p className="text-sm text-gray-600">
        Requirements for this additional sacrament can be uploaded in My Profile
        after staff confirms its ceremony date and time by SMS.
      </p>
      <p className="text-xs text-gray-500">
        Physical copies must be received after digital approval before payment.
      </p>
      {Object.entries(errors)
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, messages]) => (
          <p key={key} className="text-xs text-red-600">
            {messages[0]}
          </p>
        ))}
    </div>
  );
}
