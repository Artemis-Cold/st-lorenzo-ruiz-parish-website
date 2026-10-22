import type { User } from "@/types/user";

export function canStaff(user: User | null, permission: string) {
  return (
    !!user &&
    user.is_active !== false &&
    (user.role === "admin" ||
      (user.role === "staff" && (user.permissions ?? []).includes(permission)))
  );
}

export const staffPages: Record<string, string> = {
  "/staff/dashboard": "dashboard.view",
  "/staff/announcements": "announcements.manage",
  "/staff/events": "events.manage",
  "/staff/availability": "availability.manage",
  "/staff/bookings": "bookings.manage",
  "/staff/mass-intentions": "mass_intentions.view",
  "/staff/requests": "requests.manage",
  "/staff/transactions": "transactions.view",
  "/staff/settings/pricing": "pricing.manage",
  "/staff/settings/navigation-markers": "markers.view",
  "/staff/navigation-markers": "markers.view",
};
export function canStaffPage(user: User | null, path: string) {
  if (path === "/staff/settings") return true;
  if (path === "/staff/settings/accounts") return user?.role === "admin";
  return !!staffPages[path] && canStaff(user, staffPages[path]);
}
export function staffHome(user: User | null) {
  return (
    Object.keys(staffPages).find((path) => canStaffPage(user, path)) ??
    "/staff/settings"
  );
}
