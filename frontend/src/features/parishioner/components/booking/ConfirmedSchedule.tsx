import { useApprovedSchedule } from "./approvedSchedule";
import BookingCard from "./BookingCard";

export default function ConfirmedSchedule() {
  const request = useApprovedSchedule();
  if (!request) return null;
  return (
    <BookingCard
      title={
        request.review.status === "confirmed"
          ? "Confirmed Schedule"
          : "Requested Schedule"
      }
    >
      <p className="font-medium">
        {new Date(`${request.date}T00:00:00`).toLocaleDateString("en-PH", {
          dateStyle: "long",
        })}{" "}
        · {request.slot.start_time.slice(0, 5)}–
        {request.slot.end_time.slice(0, 5)}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        {request.review.status === "confirmed"
          ? "Your schedule is confirmed. Complete these details, then upload requirements in My Profile."
          : "Submit your package and details for schedule review. We will send an SMS when you can upload requirements in My Profile."}
      </p>
    </BookingCard>
  );
}
