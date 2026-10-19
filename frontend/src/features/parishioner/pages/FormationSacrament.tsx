import ReviewSection from "../components/booking/ReviewSection";
import ScheduleApprovalGate from "../components/booking/ScheduleApprovalGate";
import FieldError from "../components/booking/FieldError";
import { validateFormation } from "../components/booking/formationValidation";
import { validationStep } from "../components/booking/validationStep";
import ServiceRequirements from "../components/booking/ServiceRequirements";
import RequestedSchedule from "../components/booking/RequestedSchedule";
import ConfirmedSchedule from "../components/booking/ConfirmedSchedule";
import { useApprovedSchedule } from "../components/booking/approvedSchedule";
import { Plus, Trash2 } from "lucide-react";
import {
  cloneElement,
  createContext,
  useContext,
  isValidElement,
  useEffect,
  useState,
  useId,
  type InputHTMLAttributes,
} from "react";
import BookingLabel from "../components/booking/BookingLabel";

import { Skeleton } from "@/components/ui/skeleton";
import type { BookingSlot } from "@/services/bookingSlotService";
import { submitFormationSacramentBooking } from "@/services/formationSacramentBookingService";
import {
  getServicePackages,
  type ServicePackage,
} from "@/services/servicePackageService";
import { formatPhpCurrency } from "@/utils/currency";
import DashboardLayout from "../components/DashboardLayout";
import AlertBanner from "../components/booking/AlertBanner";
import {
  BookingCard,
  BookingFooter,
  BookingHeader,
  BookingStepper,
} from "../components/booking";
import type {
  FormationSacramentBooking,
  FormationSacramentCode,
  FormationSacramentParent,
  FormationSacramentSponsor,
} from "../types/formationSacrament";

interface Props {
  serviceCode: FormationSacramentCode;
}

const emptyPerson = () => ({
  first_name: "",
  middle_initial: "",
  last_name: "",
  suffix: "",
});

const emptySponsor = (): FormationSacramentSponsor => ({
  ...emptyPerson(),
  role: "godfather",
  address: "",
  requirement_type: "",
  requirement_file: null,
});

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#B22222]";

const packageTotal = (item: ServicePackage) =>
  item.base_price +
  item.inclusions.reduce((sum, inclusion) => sum + inclusion.price, 0);

const FieldErrors = createContext<Record<string, string[]>>({});

function Field({
  label,
  name,
  required = true,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const fieldId = useId();
  const error = useContext(FieldErrors)[name]?.[0];
  const labels: Record<string, string> = {
    first_name: "First Name",
    "first name": "First Name",
    "First name": "First Name",
    middle_initial: "MI",
    "middle initial": "MI",
    "Middle initial": "MI",
    last_name: "Last Name",
    "last name": "Last Name",
    "Last name": "Last Name",
    suffix: "Suffix",
    "Parish origin": "Parish of Origin",
    "Parish of origin": "Parish of Origin",
    "Date baptized": "Date of Baptism",
    "Church baptized": "Baptized In",
    Birthdate: "Birthday",
    Birthplace: "Place of Birth",
    "Contact number": "Contact Number",
    "Present address": "Address",
    Role: "Sponsor Role",
  };
  const title = labels[label] ?? label;
  const placeholders: Record<string, string> = {
    MI: "M",
    Suffix: "Jr., Sr., III (optional)",
    Address: "Street, Barangay, Municipality/City",
    "Parish of Origin": "Enter parish name",
    "Baptized In": "Enter church name",
    "Place of Birth": "Enter place of birth",
  };
  const input = isValidElement<InputHTMLAttributes<HTMLInputElement>>(children)
    ? cloneElement(children, {
        id: fieldId,
        name,
        placeholder:
          children.type !== "input" ||
          (children.props.type &&
            !["text", "tel"].includes(children.props.type))
            ? undefined
            : (children.props.placeholder ??
              placeholders[title] ??
              `Enter ${title.toLowerCase()}`),
      })
    : children;
  return (
    <div className="min-w-0">
      <BookingLabel
        htmlFor={fieldId}
        className="mb-2 block text-sm font-medium"
      >
        {title} {required && <span className="text-red-600">*</span>}
      </BookingLabel>
      {input}
      <FieldError message={error} />
    </div>
  );
}

function NameFields({
  prefix,
  person,
  onChange,
  address,
  onAddressChange,
}: {
  prefix: string;
  person: ReturnType<typeof emptyPerson>;
  address?: string;
  onAddressChange?: (value: string) => void;
  onChange: (
    field: keyof ReturnType<typeof emptyPerson>,
    value: string,
  ) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {(["last_name", "first_name", "middle_initial"] as const).map((field) => (
        <div
          key={field}
          className={
            field === "middle_initial"
              ? "col-span-12 max-w-24 md:col-span-2 md:max-w-none"
              : "col-span-12 md:col-span-5"
          }
        >
          <Field
            name={`${prefix}.${field}`}
            label={field}
            required={field !== "middle_initial"}
          >
            <input
              className={inputClass}
              value={person[field]}
              maxLength={field === "middle_initial" ? 1 : undefined}
              onChange={(event) => onChange(field, event.target.value)}
            />
          </Field>
        </div>
      ))}
      <div className="col-span-12 max-w-48 md:col-span-3 md:max-w-none">
        <Field name={`${prefix}.suffix`} label="Suffix" required={false}>
          <input
            className={inputClass}
            value={person.suffix}
            onChange={(event) => onChange("suffix", event.target.value)}
          />
        </Field>
      </div>
      {onAddressChange && (
        <div className="col-span-12 md:col-span-9">
          <Field name={`${prefix}.address`} label="Address">
            <input
              className={inputClass}
              value={address ?? ""}
              onChange={(event) => onAddressChange(event.target.value)}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export default function FormationSacrament({ serviceCode }: Props) {
  if (serviceCode === "first-communion")
    return (
      <FormationSacramentForm key={serviceCode} serviceCode={serviceCode} />
    );
  return (
    <ScheduleApprovalGate
      key={serviceCode}
      serviceCode={serviceCode}
      title={
        serviceCode === "confirmation" ? "Confirmation" : "First Communion"
      }
    >
      <FormationSacramentForm serviceCode={serviceCode} />
    </ScheduleApprovalGate>
  );
}

function FormationSacramentForm({ serviceCode }: Props) {
  const approvedSchedule = useApprovedSchedule();

  const confirmation = serviceCode === "confirmation";
  const serviceName = confirmation ? "Confirmation" : "First Communion";
  const [booking, setBooking] = useState<FormationSacramentBooking>({
    booking_slot_id: approvedSchedule?.slot.id ?? 0,
    service_package_id: 0,
    candidate: {
      ...emptyPerson(),
      parish_origin: "",
      baptism_date: "",
      baptism_church: "",
      birth_date: "",
      birth_place: "",
      gender: "",
      address: "",
      contact_number: "",
    },
    parents: [
      { ...emptyPerson(), relationship: "father", birth_place: "" },
      { ...emptyPerson(), relationship: "mother", birth_place: "" },
    ],
    sponsors: confirmation ? [emptySponsor()] : [],
    baptismal_certificate: null,
    remarks: "",
  });
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    approvedSchedule ? new Date(`${approvedSchedule.date}T00:00:00`) : null,
  );

  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(
    approvedSchedule?.slot ?? null,
  );
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null,
  );

  const [loadingPackages, setLoadingPackages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const steps = [
    "Requirements",
    ...(confirmation ? ["Schedule"] : []),
    ...(confirmation ? ["Package"] : []),
    "Applicant Details",
    ...(confirmation ? ["Sponsors"] : []),
    "Review",
  ];

  useEffect(() => {
    if (!confirmation) return;
    getServicePackages(serviceCode)
      .then(setPackages)
      .catch(() => setError("Unable to load the available package."))
      .finally(() => setLoadingPackages(false));
  }, [serviceCode, confirmation]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const updateCandidate = (
    field: keyof FormationSacramentBooking["candidate"],
    value: string,
  ) =>
    setBooking((current) => ({
      ...current,
      candidate: { ...current.candidate, [field]: value },
    }));

  const updateParent = (
    relationship: FormationSacramentParent["relationship"],
    field: keyof FormationSacramentParent,
    value: string,
  ) =>
    setBooking((current) => ({
      ...current,
      parents: current.parents.map((parent) =>
        parent.relationship === relationship
          ? { ...parent, [field]: value }
          : parent,
      ),
    }));

  const updateSponsor = (
    index: number,
    field: keyof FormationSacramentSponsor,
    value: FormationSacramentSponsor[keyof FormationSacramentSponsor],
  ) =>
    setBooking((current) => ({
      ...current,
      sponsors: current.sponsors.map((sponsor, sponsorIndex) =>
        sponsorIndex === index ? { ...sponsor, [field]: value } : sponsor,
      ),
    }));

  const next = async () => {
    if (submitting) return;
    setValidationAttempt((attempt) => attempt + 1);
    setError(null);
    const errors = validateFormation(booking, steps[step - 1]);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Please correct the highlighted fields before continuing.");
      return;
    }
    if (confirmation && step === 2 && !booking.booking_slot_id) {
      setError("Select a schedule before continuing.");
      return;
    }
    if (steps[step - 1] === "Package" && !booking.service_package_id) {
      setError("Select a package before continuing.");
      return;
    }
    if (step < steps.length) {
      setStep((current) => current + 1);
      return;
    }
    if (!agreed) {
      setError("Confirm that the submitted information is accurate.");
      return;
    }

    setSubmitting(true);
    try {
      await submitFormationSacramentBooking(
        serviceCode,
        booking,
        approvedSchedule?.id ?? 0,
      );
      setSubmitted(true);
    } catch (failure) {
      const validation = failure as {
        validationErrors?: Record<string, string[]>;
      };
      const firstMessage = validation.validationErrors
        ? Object.values(validation.validationErrors).flat()[0]
        : null;
      if (validation.validationErrors) {
        setFieldErrors(validation.validationErrors);
        setStep(validationStep(serviceCode, validation.validationErrors, step));
      }
      setError(
        firstMessage ?? "Unable to submit the booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderRequirements = () => (
    <ServiceRequirements service={serviceCode} />
  );

  const renderSchedule = () =>
    approvedSchedule ? (
      <ConfirmedSchedule key="schedule" />
    ) : (
      <RequestedSchedule
        key="schedule"
        service={serviceCode}
        date={selectedDate}
        slot={selectedSlot}
        onDateChange={setSelectedDate}
        onSlotChange={(slot) => {
          setSelectedSlot(slot);
          setBooking((current) => ({
            ...current,
            booking_slot_id: slot?.id ?? 0,
          }));
        }}
      />
    );

  const renderPackage = () => (
    <BookingCard title={`${serviceName} Package`}>
      <p className="mb-5 text-sm text-gray-600">
        Select a package for one{" "}
        {confirmation ? "Confirmation" : "First Communion"} candidate.
        <span lang="tl" className="mt-1 block text-xs">
          Pumili ng pakete para sa isang tatanggap ng sakramento.
        </span>
      </p>
      {loadingPackages ? (
        <Skeleton className="h-36 rounded-2xl" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((item) => (
            <button
              type="button"
              aria-pressed={booking.service_package_id === item.id}
              key={item.id}
              onClick={() => {
                setSelectedPackage(item);
                setBooking((current) => ({
                  ...current,
                  service_package_id: item.id,
                }));
              }}
              className={`rounded-2xl border p-5 text-left transition ${
                booking.service_package_id === item.id
                  ? "border-[#B22222] bg-red-50 ring-2 ring-red-100"
                  : "border-gray-200 hover:border-red-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#B22222]">
                  {booking.service_package_id === item.id
                    ? "Selected"
                    : "Select package"}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#B22222]">
                {formatPhpCurrency(packageTotal(item))}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {packageTotal(item) === 0
                  ? "No service fee / Walang bayad sa serbisyo"
                  : "Total per candidate / Kabuuang bayad bawat kandidato"}
              </p>
              <div className="mt-5 flex justify-between border-t border-gray-200 pt-4 text-sm text-gray-700">
                <span>Base fee / Pangunahing bayad</span>
                <span>{formatPhpCurrency(item.base_price)}</span>
              </div>
              {item.inclusions.length > 0 && (
                <p className="mt-4 text-sm font-semibold">
                  Package inclusions / Kasama sa pakete
                </p>
              )}
              {item.inclusions.map((inclusion) => (
                <p
                  key={inclusion.id}
                  className="mt-2 flex justify-between gap-4 text-sm text-gray-600"
                >
                  <span>✓ {inclusion.name}</span>
                  <span>
                    {inclusion.price === 0
                      ? "Included"
                      : formatPhpCurrency(inclusion.price)}
                  </span>
                </p>
              ))}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] p-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Before your appointment / Bago ang iskedyul
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            Baptismal Certificate is required. / Kailangan ang sertipiko ng
            binyag.
          </li>
          {confirmation && (
            <li>
              At least one sponsor is required, with a Marriage Contract or
              Confirmation Certificate. / Kailangan ng kahit isang ninong o
              ninang na may sertipiko ng kasal o kumpil.
            </li>
          )}
          <li>
            Parish staff will send the seminar schedule by SMS. / Ipapadala ng
            staff ang iskedyul ng seminar sa SMS.
          </li>
          <li>
            Bring physical documents only after digital approval. Payment, if
            applicable, opens after staff receive all required physical copies.
            / Dalhin ang mga dokumento matapos maaprubahan online. Maaari lamang
            magbayad kapag natanggap na ang lahat ng kinakailangang pisikal na
            kopya.
          </li>
        </ul>
      </div>
    </BookingCard>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      <BookingCard title={`${serviceName} Candidate`}>
        <NameFields
          prefix="candidate"
          person={booking.candidate}
          onChange={updateCandidate}
          address={booking.candidate.address}
          onAddressChange={(value) => updateCandidate("address", value)}
        />
        <div className="mt-5 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            <Field name="candidate.gender" label="Gender">
              <select
                className={inputClass}
                value={booking.candidate.gender}
                onChange={(event) =>
                  updateCandidate("gender", event.target.value)
                }
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </Field>
          </div>
          {(
            [
              ["birth_date", "Birthdate", "date", "col-span-12 md:col-span-5"],
              [
                "birth_place",
                "Birthplace",
                "text",
                "col-span-12 md:col-span-7",
              ],
              [
                "contact_number",
                "Contact number",
                "tel",
                "col-span-12 md:col-span-5",
              ],
            ] as const
          ).map(([key, label, type, className]) => (
            <div key={key} className={className}>
              <Field name={`candidate.${key}`} label={label}>
                <input
                  type={type}
                  className={inputClass}
                  value={booking.candidate[key]}
                  max={
                    type === "date"
                      ? new Date().toISOString().split("T")[0]
                      : undefined
                  }
                  maxLength={key === "contact_number" ? 11 : undefined}
                  placeholder={
                    key === "contact_number" ? "09XXXXXXXXX" : undefined
                  }
                  inputMode={key === "contact_number" ? "numeric" : undefined}
                  onChange={(event) =>
                    updateCandidate(
                      key,
                      key === "contact_number"
                        ? event.target.value.replace(/\D/g, "")
                        : event.target.value,
                    )
                  }
                />
              </Field>
            </div>
          ))}
        </div>
      </BookingCard>
      <BookingCard title="Sacramental Information">
        <div className="grid grid-cols-12 gap-4">
          {(
            [
              ["parish_origin", "Parish origin", "text", "col-span-12"],
              [
                "baptism_date",
                "Date baptized",
                "date",
                "col-span-12 md:col-span-5",
              ],
              [
                "baptism_church",
                "Church baptized",
                "text",
                "col-span-12 md:col-span-7",
              ],
            ] as const
          ).map(([key, label, type, className]) => (
            <div key={key} className={className}>
              <Field name={`candidate.${key}`} label={label}>
                <input
                  type={type}
                  className={inputClass}
                  value={booking.candidate[key]}
                  max={
                    type === "date"
                      ? new Date().toISOString().split("T")[0]
                      : undefined
                  }
                  onChange={(event) => updateCandidate(key, event.target.value)}
                />
              </Field>
            </div>
          ))}
        </div>
      </BookingCard>

      {booking.parents.map((parent, index) => (
        <BookingCard
          key={parent.relationship}
          title={`${parent.relationship === "father" ? "Father" : "Mother"} Information`}
        >
          <NameFields
            prefix={`parents.${index}`}
            person={parent}
            onChange={(field, value) =>
              updateParent(parent.relationship, field, value)
            }
          />
          <div className="mt-4">
            <Field name={`parents.${index}.birth_place`} label="Birthplace">
              <input
                className={inputClass}
                value={parent.birth_place}
                onChange={(event) =>
                  updateParent(
                    parent.relationship,
                    "birth_place",
                    event.target.value,
                  )
                }
              />
            </Field>
          </div>
        </BookingCard>
      ))}
    </div>
  );

  const renderSponsors = () => (
    <BookingCard title="Sponsors">
      <div className="space-y-4">
        {booking.sponsors.map((sponsor, index) => (
          <div key={index} className="rounded-2xl border border-gray-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-semibold">Sponsor {index + 1}</p>
              {booking.sponsors.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setBooking((current) => ({
                      ...current,
                      sponsors: current.sponsors.filter(
                        (_, sponsorIndex) => sponsorIndex !== index,
                      ),
                    }))
                  }
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  aria-label={`Remove sponsor ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field name={`sponsors.${index}.role`} label="Role">
                <select
                  className={inputClass}
                  value={sponsor.role}
                  onChange={(event) =>
                    updateSponsor(index, "role", event.target.value)
                  }
                >
                  <option value="godfather">Godfather (Ninong)</option>
                  <option value="godmother">Godmother (Ninang)</option>
                </select>
              </Field>
              <div className="md:col-span-2 lg:col-span-4">
                <NameFields
                  prefix={`sponsors.${index}`}
                  person={sponsor}
                  address={sponsor.address}
                  onAddressChange={(value) =>
                    updateSponsor(index, "address", value)
                  }
                  onChange={(field, value) =>
                    updateSponsor(index, field, value)
                  }
                />
              </div>
              <Field
                name={`sponsors.${index}.requirement_type`}
                label="Certificate to submit"
              >
                <select
                  className={inputClass}
                  value={sponsor.requirement_type}
                  onChange={(event) =>
                    updateSponsor(
                      index,
                      "requirement_type",
                      event.target
                        .value as FormationSacramentSponsor["requirement_type"],
                    )
                  }
                >
                  <option value="">Select certificate</option>
                  <option value="marriage_contract">
                    Marriage Contract (married in church)
                  </option>
                  <option value="confirmation_certificate">
                    Confirmation Certificate
                  </option>
                </select>
              </Field>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="mt-1 text-xs text-gray-500">
                  Upload in My Profile after schedule confirmation.
                </p>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setBooking((current) => ({
              ...current,
              sponsors: [...current.sponsors, emptySponsor()],
            }))
          }
          className="inline-flex items-center gap-2 rounded-xl border border-[#B22222] px-4 py-2.5 font-semibold text-[#B22222] hover:bg-red-50"
        >
          <Plus size={18} /> Add Sponsor
        </button>
      </div>
    </BookingCard>
  );

  const editReview = (section: string) => {
    setAgreed(false);
    setError(null);
    setFieldErrors({});
    setStep(steps.indexOf(section) + 1);
  };

  const renderReview = () => (
    <div className="space-y-6">
      <ReviewSection
        title="Schedule"
        onEdit={confirmation ? () => editReview("Schedule") : undefined}
        data={{
          schedule: confirmation
            ? (selectedDate?.toLocaleDateString() ??
                "Not provided / Hindi ibinigay") +
              " " +
              (selectedSlot?.start_time ?? "")
            : "To be announced by the parish / Ipapahayag ng parokya",
          requirements:
            "Upload in My Profile after schedule confirmation / I-upload matapos makumpirma ang iskedyul",
        }}
      />
      <ReviewSection
        title="Service Fee"
        onEdit={confirmation ? () => editReview("Package") : undefined}
        data={
          confirmation
            ? {
                package: selectedPackage?.name,
                inclusions: selectedPackage?.inclusions.map((item) => ({
                  name: item.name,
                  price: formatPhpCurrency(item.price),
                })),
                total: selectedPackage
                  ? formatPhpCurrency(packageTotal(selectedPackage))
                  : "Not provided / Hindi ibinigay",
              }
            : { fee: "Free / Walang bayad" }
        }
      />
      <ReviewSection
        title="Applicant Details"
        onEdit={() => editReview("Applicant Details")}
        data={{ candidate: booking.candidate, parents: booking.parents }}
      />
      {confirmation && (
        <ReviewSection
          title="Sponsors"
          onEdit={() => editReview("Sponsors")}
          data={booking.sponsors.map(({ requirement_file, ...person }) => ({
            ...person,
            documents:
              requirement_file?.name ??
              "Upload after schedule confirmation / I-upload matapos makumpirma ang iskedyul",
          }))}
        />
      )}
      <label className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-1 size-5 accent-[#B22222]"
        />
        I confirm that the information provided is true and accurate, and I
        agree to follow the parish seminar schedule.
      </label>
    </div>
  );

  const pages = [
    renderRequirements(),
    ...(confirmation ? [renderSchedule()] : []),
    ...(confirmation ? [renderPackage()] : []),
    renderDetails(),
    ...(confirmation ? [renderSponsors()] : []),
    renderReview(),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BookingHeader
          title={serviceName}
          subtitle={`Book the Sacrament of ${serviceName}`}
        />
        <BookingStepper currentStep={step} steps={steps} />
        {submitted ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-800">
            Your {serviceName} booking was submitted successfully. Parish staff
            {confirmation
              ? " will review your requested date and time."
              : " will assign the ceremony date and notify you by SMS. / Ang parokya ang magtatakda ng petsa at magpapadala ng SMS."}{" "}
            Wait for the confirmation SMS, then upload requirements in My
            Profile.
          </div>
        ) : (
          <>
            {error && (
              <AlertBanner
                key={validationAttempt}
                message={error}
                errors={fieldErrors}
              />
            )}
            <FieldErrors.Provider value={fieldErrors}>
              {pages[step - 1]}
            </FieldErrors.Provider>
            <BookingFooter
              busy={submitting}
              previous={
                step > 1
                  ? () => {
                      setError(null);
                      setStep((current) => current - 1);
                    }
                  : undefined
              }
              next={() => void next()}
              previousText="Back"
              nextText={
                step === steps.length
                  ? submitting
                    ? "Submitting..."
                    : "Submit Booking"
                  : `Continue to ${steps[step]}`
              }
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
