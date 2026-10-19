import { createContext, useContext } from "react";
import type { ScheduleRequest } from "@/services/scheduleReviewService";

export const ApprovedScheduleContext = createContext<ScheduleRequest | null>(
  null,
);

export function useApprovedSchedule() {
  return useContext(ApprovedScheduleContext);
}

export const BookingUploadsLockedContext = createContext(false);
