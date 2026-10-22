import test from "node:test";
import assert from "node:assert/strict";
import { canStaff, canStaffPage, staffHome } from "./permissions.ts";

test("accountant navigation is limited to transactions and personal settings", () => {
  const user = {
    role: "staff",
    is_active: true,
    permissions: ["transactions.view"],
  };
  assert.equal(staffHome(user), "/staff/transactions");
  assert.equal(canStaffPage(user, "/staff/transactions"), true);
  assert.equal(canStaffPage(user, "/staff/settings"), true);
  for (const path of [
    "/staff/dashboard",
    "/staff/bookings",
    "/staff/settings/accounts",
    "/staff/settings/pricing",
    "/staff/settings/navigation-markers",
  ])
    assert.equal(canStaffPage(user, path), false, path);
  assert.equal(canStaff(user, "transactions.confirm"), false);
});
test("main admin is unrestricted while new, inactive and parishioner accounts cannot bypass permissions", () => {
  assert.equal(
    canStaffPage(
      { role: "admin", is_active: true },
      "/staff/settings/accounts",
    ),
    true,
  );
  assert.equal(
    canStaff({ role: "admin", is_active: false }, "transactions.view"),
    false,
  );
  assert.equal(canStaff({ role: "staff" }, "transactions.view"), false);
  assert.equal(
    canStaff(
      { role: "parishioner", permissions: ["transactions.view"] },
      "transactions.view",
    ),
    false,
  );
  assert.equal(
    canStaffPage({ role: "staff", permissions: [] }, "/staff/unknown"),
    false,
  );
  assert.equal(
    staffHome({ role: "staff", permissions: [] }),
    "/staff/settings",
  );
});
