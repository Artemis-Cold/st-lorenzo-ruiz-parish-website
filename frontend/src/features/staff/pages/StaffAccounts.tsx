import { useEffect, useState } from "react";
import {
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  Users,
  LockKeyhole,
} from "lucide-react";
import SettingsPageHeader from "../components/SettingsPageHeader";
import CreateStaffForm from "../components/CreateStaffForm";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/alert-dialog";
import api from "@/api/axios";
import type { User } from "@/types/user";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import PermissionChecklist from "../components/PermissionChecklist";

export default function StaffAccounts() {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] = useState<"save" | "discard" | null>(
    null,
  );
  const [nextAccount, setNextAccount] = useState<User | null>(null);
  const changed =
    selected !== null &&
    (active !== (selected.is_active !== false) ||
      [...permissions].sort().join("|") !==
        [...(selected.permissions ?? [])].sort().join("|"));
  function edit(account: User | null) {
    setSelected(account);
    setPermissions(account?.permissions ?? []);
    setActive(account?.is_active !== false);
    setError("");
  }
  function requestEdit(account: User | null) {
    if (changed) {
      setNextAccount(account);
      setConfirmation("discard");
    } else edit(account);
  }
  useEffect(() => {
    api
      .get("/staff/settings/staff")
      .then((response) => setAccounts(response.data.data))
      .catch(() =>
        setError("Unable to load staff accounts. Please reload to try again."),
      )
      .finally(() => setLoading(false));
  }, []);
  async function save() {
    if (!selected || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await api.patch(
        `/staff/settings/staff/${selected.id}/access`,
        { permissions, is_active: active },
      );
      setAccounts((current) =>
        current.map((item) =>
          item.id === selected.id ? response.data.user : item,
        ),
      );
      setSelected(null);
      setConfirmation(null);
      setMessage(
        `Access for ${selected.full_name} has been updated successfully.`,
      );
    } catch {
      setConfirmation(null);
      setError(
        "We couldn't save these changes. Your changes are still here. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <StaffDashboardLayout>
      <div className="space-y-5">
        <SettingsPageHeader
          icon={ShieldCheck}
          title="Staff Accounts & Permissions"
          description="Add parish staff and choose which areas they can access. Only the Main Admin can manage staff accounts."
        />
        {message && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-[#292524]">
            <Users size={20} />
            Parish staff
          </h2>
          {!creating && (
            <button
              type="button"
              disabled={saving || selected !== null}
              onClick={() => {
                setCreating(true);
                setMessage("");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] px-4 py-3 text-sm font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50"
            >
              <UserPlus size={17} />
              Add parish staff
            </button>
          )}
        </div>
        {selected && (
          <p className="text-sm text-gray-500">
            Save or cancel your edits before adding another staff member.
          </p>
        )}
        {creating && (
          <CreateStaffForm
            onCancel={() => setCreating(false)}
            onCreated={(account) => {
              setAccounts((current) => [...current, account]);
              setCreating(false);
              setMessage(
                `Staff account for ${account.full_name} has been created successfully.`,
              );
            }}
          />
        )}
        {loading && (
          <p role="status" className="text-sm text-gray-500">
            Loading staff accounts…
          </p>
        )}
        {!loading && !error && accounts.length === 0 && (
          <p className="rounded-2xl border border-[#E7E2DA] bg-white p-6 text-sm text-gray-600">
            No staff accounts found.
          </p>
        )}
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 sm:p-5 ${selected?.id === account.id ? "border-[#B22222] ring-1 ring-[#B22222]/10" : "border-[#E7E2DA]"}`}
            >
              <div>
                <p className="break-words font-semibold text-[#292524]">
                  {account.full_name}
                </p>
                <p className="break-all text-sm text-gray-600">
                  @{account.username} ·{" "}
                  {account.role === "admin"
                    ? "Main Admin"
                    : account.is_active !== false
                      ? "Active"
                      : "Inactive"}
                </p>
              </div>
              {account.role === "admin" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                  <LockKeyhole size={13} />
                  Protected account
                </span>
              ) : (
                <button
                  type="button"
                  disabled={saving || creating || selected?.id === account.id}
                  className="rounded-xl border border-[#B22222]/20 px-4 py-2 text-sm font-semibold text-[#B22222] hover:bg-red-50 disabled:opacity-50"
                  onClick={() => {
                    requestEdit(account);
                    setMessage("");
                  }}
                >
                  {selected?.id === account.id
                    ? "Editing access"
                    : "Edit access"}
                </button>
              )}
            </div>
          ))}
        </div>
        {selected && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (changed) setConfirmation("save");
            }}
            className="space-y-5 rounded-3xl border border-[#E7E2DA] bg-white p-5 sm:p-6"
          >
            <h2 className="font-serif text-xl font-bold text-[#292524]">
              Access for {selected.full_name}
            </h2>
            <fieldset disabled={saving} className="space-y-4">
              <PermissionChecklist
                value={permissions}
                onChange={setPermissions}
              />
              <label className="flex items-start gap-3 rounded-2xl border border-[#E7E2DA] bg-[#FAF8F5] p-4">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-[#B22222]"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                />
                <span>
                  <span className="block text-sm font-semibold text-[#292524]">
                    Account active
                  </span>
                  <span className="mt-1 block text-xs text-gray-600">
                    Turn off to prevent this staff member from accessing their
                    account. Their records will be kept.
                  </span>
                </span>
              </label>
              <div className="flex flex-col gap-3 border-t border-[#E7E2DA] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={!changed || saving}
                  className="rounded-xl bg-[#B22222] px-5 py-3 text-sm font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save permissions"}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => requestEdit(null)}
                >
                  Cancel
                </button>
              </div>
            </fieldset>
          </form>
        )}
      </div>
      <AlertDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setConfirmation(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border border-[#E7E2DA] bg-white">
          <AlertDialogHeader>
            <span className="mb-2 rounded-xl bg-[#B22222]/10 p-3 text-[#B22222]">
              <ShieldCheck size={24} />
            </span>
            <AlertDialogTitle className="font-serif text-xl font-bold text-[#292524]">
              {confirmation === "discard"
                ? "Discard unsaved changes?"
                : !active
                  ? "Deactivate this account?"
                  : "Save staff access?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation === "discard"
                ? "Your changes haven't been saved. Discard them to continue, or go back to keep editing."
                : !active
                  ? `${selected?.full_name} will no longer be able to use their account. Their records will be kept, and you can reactivate the account later.`
                  : `Update the areas ${selected?.full_name} can access?${selected?.is_active === false ? " Their account will also be reactivated." : ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirmation === "save" && (
            <p className="rounded-xl bg-[#FAF8F5] p-3 text-sm text-gray-600">
              {permissions.length === 0
                ? "No permissions selected. This staff member will not be able to open any management pages."
                : `${permissions.length} permissions selected.`}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              {confirmation === "discard" ? "Keep editing" : "Go back"}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              className="bg-[#B22222] text-white hover:bg-[#991B1B]"
              onClick={(event) => {
                event.preventDefault();
                if (confirmation === "discard") {
                  edit(nextAccount);
                  setNextAccount(null);
                  setConfirmation(null);
                } else void save();
              }}
            >
              {saving
                ? "Saving…"
                : confirmation === "discard"
                  ? "Discard changes"
                  : !active
                    ? "Deactivate account"
                    : "Save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StaffDashboardLayout>
  );
}
