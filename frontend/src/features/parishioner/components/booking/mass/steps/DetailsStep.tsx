import FieldError from "@/features/parishioner/components/booking/FieldError";
import type { Dispatch, SetStateAction } from "react";
import BookingLabel from "../../BookingLabel";

import { BookingCard } from "../..";

import type {
  MassIntentionBooking,
  IntentionEntry,
  IntentionType,
} from "../../../../types/mass";

interface DetailsStepProps {
  booking: MassIntentionBooking;
  setBooking: Dispatch<SetStateAction<MassIntentionBooking>>;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
}

export default function DetailsStep({
  booking,
  setBooking,
  readOnly = false,
  errors,
}: DetailsStepProps) {
  const getError = (key: string) => errors?.[key]?.[0];
  const inputClass = `
w-full rounded-lg border px-4 py-2 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
}
`;

  const updateEntry = (
    type: IntentionType,
    entryId: number,
    nameIndex: number,
    value: string,
  ) => {
    setBooking((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.type !== type
          ? group
          : {
              ...group,
              entries: group.entries.map((entry) =>
                entry.id !== entryId
                  ? entry
                  : {
                      ...entry,
                      names: Array.from({ length: 3 }, (_, index) =>
                        index === nameIndex
                          ? value
                          : (entry.names[index] ?? ""),
                      ),
                    },
              ),
            },
      ),
    }));
  };

  const addEntry = (type: IntentionType) => {
    setBooking((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.type !== type
          ? group
          : {
              ...group,
              entries: [
                ...group.entries,
                {
                  id: Date.now(),
                  names: [],
                },
              ],
            },
      ),
    }));
  };

  const removeEntry = (type: IntentionType, entryId: number) => {
    setBooking((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.type !== type
          ? group
          : {
              ...group,
              entries: group.entries.filter((entry) => entry.id !== entryId),
            },
      ),
    }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {booking.groups.map((group) => (
        <BookingCard key={group.type} title={group.type}>
          <div className="space-y-4">
            {group.entries.map((entry: IntentionEntry, index) => (
              <div key={entry.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-lg font-semibold text-[#B22222]">
                  {index + 1}
                </span>

                <div className="flex-1">
                  {[0, 1, 2].map((nameIndex) => (
                    <div key={nameIndex} className="mb-3">
                      <BookingLabel
                        htmlFor={`intention-${group.type}-${entry.id}-${nameIndex}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        Name {nameIndex + 1} / Pangalan {nameIndex + 1}
                      </BookingLabel>
                      <input
                        id={`intention-${group.type}-${entry.id}-${nameIndex}`}
                        type="text"
                        maxLength={150}
                        readOnly={readOnly}
                        className={
                          inputClass +
                          (getError(
                            "groups." +
                              booking.groups.indexOf(group) +
                              ".entries." +
                              index +
                              ".names",
                          )
                            ? " border-red-400"
                            : "")
                        }
                        placeholder="One person's full name / Buong pangalan"
                        value={entry.names[nameIndex] ?? ""}
                        onChange={(e) =>
                          updateEntry(
                            group.type,
                            entry.id,
                            nameIndex,
                            e.target.value,
                          )
                        }
                      />
                      <FieldError
                        message={getError(
                          `groups.${booking.groups.indexOf(group)}.entries.${index}.names.${nameIndex}`,
                        )}
                      />
                    </div>
                  ))}
                  <FieldError
                    message={getError(
                      "groups." +
                        booking.groups.indexOf(group) +
                        ".entries." +
                        index +
                        ".names",
                    )}
                  />
                </div>

                {!readOnly && group.entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(group.type, entry.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {!readOnly && (
              <button
                type="button"
                onClick={() => addEntry(group.type)}
                className="rounded-lg bg-[#B22222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8B1C1C]"
              >
                + Add Intention
              </button>
            )}

            <p className="text-xs italic text-gray-500">
              Maximum of <strong>3 people</strong> per numbered entry. Enter one
              person's full name per field. Add another intention for more
              names.
              <span lang="tl" className="mt-1 block">
                Hanggang tatlong tao bawat bilang. Isang buong pangalan bawat
                field. Magdagdag ng intensyon para sa iba pang pangalan.
              </span>
            </p>
          </div>
        </BookingCard>
      ))}
    </div>
  );
}
