import { useEffect, useState, type ReactNode } from "react";
import DashboardLayout from "../DashboardLayout";
import {
  getScheduleRequests,
  type ScheduleRequest,
} from "@/services/scheduleReviewService";
import {
  ApprovedScheduleContext,
  BookingUploadsLockedContext,
} from "./approvedSchedule";

// Resume earlier unfinished requests without putting schedule selection before requirements.
export default function ScheduleApprovalGate({
  serviceCode,
  children,
}: {
  serviceCode: string;
  title: string;
  children: ReactNode;
}) {
  const [request, setRequest] = useState<ScheduleRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getScheduleRequests(serviceCode)
      .then((items) => {
        if (!active) return;
        const id = Number(
          new URLSearchParams(window.location.search).get("scheduleRequest"),
        );
        setRequest(
          items.find((item) => item.id === id) ??
            items.find((item) => item.review.status !== "rejected") ??
            null,
        );
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [serviceCode]);
  if (loading || error || request?.review.status === "rejected") {
    return (
      <DashboardLayout>
        <p role={error ? "alert" : undefined}>
          {loading
            ? "Loading booking…"
            : error
              ? "Unable to load your booking. Please refresh to try again."
              : "Please reschedule this rejected request from My Profile before continuing."}
        </p>
      </DashboardLayout>
    );
  }
  return (
    <ApprovedScheduleContext.Provider value={request}>
      <BookingUploadsLockedContext.Provider value={true}>
        {children}
      </BookingUploadsLockedContext.Provider>
    </ApprovedScheduleContext.Provider>
  );
}
