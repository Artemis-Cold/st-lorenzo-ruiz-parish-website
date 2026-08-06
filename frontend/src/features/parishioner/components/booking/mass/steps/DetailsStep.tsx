import type { Dispatch, SetStateAction } from "react";

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
}

export default function DetailsStep({
  booking,
  setBooking,
  readOnly = false,
}: DetailsStepProps) {
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
                      names: value
                        .split(",")
                        .map((name) => name.trim())
                        .filter(Boolean)
                        .slice(0, 3),
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
                  amount: null,
                },
              ],
            },
      ),
    }));
  };

  const removeEntry = (
    type: IntentionType,
    entryId: number,
  ) => {
    setBooking((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.type !== type
          ? group
          : {
              ...group,
              entries: group.entries.filter(
                (entry) => entry.id !== entryId,
              ),
            },
      ),
    }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {booking.groups.map((group) => (
        <BookingCard
          key={group.type}
          title={group.type}
        >
          <div className="space-y-4">
            {group.entries.map(
              (entry: IntentionEntry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3"
                >
                  <span className="w-6 text-center text-lg font-semibold text-[#B22222]">
                    {index + 1}
                  </span>

                  <input
                    type="text"
                    readOnly={readOnly}
                    className={inputClass}
                    placeholder="Enter Name/s"
                    value={entry.names.join(", ")}
                    onChange={(e) =>
                      updateEntry(
                        group.type,
                        entry.id,
                        e.target.value,
                      )
                    }
                  />

                  {!readOnly &&
                    group.entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeEntry(
                            group.type,
                            entry.id,
                          )
                        }
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                </div>
              ),
            )}

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
              Maximum of <strong>3 names</strong> per line.
              Separate names using commas.
            </p>
          </div>
        </BookingCard>
      ))}
    </div>
  );
}