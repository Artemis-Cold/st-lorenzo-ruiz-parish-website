import type { RequestStatus } from "../types/request";

const labels: Record<RequestStatus, string> = {
  pending: "Pending",
  paid: "Preparing",
  approved: "Approved",
  ready_for_pickup: "Ready for Pickup",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const requestStatusLabel = (status: RequestStatus) => labels[status];
