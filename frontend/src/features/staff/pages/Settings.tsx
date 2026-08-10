import { useState, type FormEvent } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { createStaffAccount, updateStaffPassword, updateStaffProfile } from "@/services/staffSettingsService";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ username: user?.username ?? "", first_name: user?.first_name ?? "", middle_initial: user?.middle_initial ?? "", last_name: user?.last_name ?? "", suffix: user?.suffix ?? "", phone: user?.phone ?? "" });
  const [password, setPassword] = useState({ current_password: "", password: "", password_confirmation: "" });
  const emptyStaff = { username: "", first_name: "", middle_initial: "", last_name: "", phone: "", password: "", password_confirmation: "" };
  const [newStaff, setNewStaff] = useState(emptyStaff);
  const field = "w-full rounded-xl border border-[#E7E2DA] px-4 py-3 outline-none focus:border-[#B22222]";
  const saveProfile = async (e: FormEvent) => { e.preventDefault(); try { await updateStaffProfile(profile); await refreshUser(); toast.success("Profile updated."); } catch { toast.error("Unable to update profile. Check the entered values."); } };
  const savePassword = async (e: FormEvent) => { e.preventDefault(); try { await updateStaffPassword(password); setPassword({ current_password: "", password: "", password_confirmation: "" }); toast.success("Password updated."); } catch { toast.error("Unable to update password. Check your current password."); } };
  const addStaff = async (e: FormEvent) => { e.preventDefault(); try { await createStaffAccount(newStaff); setNewStaff(emptyStaff); toast.success("Parish staff account created."); } catch { toast.error("Unable to create staff. Username or phone may already exist."); } };

  return <StaffDashboardLayout><div className="space-y-6"><div className="rounded-3xl bg-[#B22222] px-8 py-9 text-white"><div className="flex items-center gap-4"><SettingsIcon/><div><h1 className="font-serif text-3xl font-bold">Settings</h1><p className="text-sm text-white/75">Manage your staff profile and password.</p></div></div></div>
    <div className="grid gap-6 lg:grid-cols-2"><form onSubmit={saveProfile} className="space-y-4 rounded-3xl border bg-white p-6"><h2 className="font-serif text-xl font-bold">Profile</h2>{Object.entries(profile).map(([key,value]) => <label key={key} className="block text-sm font-medium capitalize">{key.replaceAll("_"," ")}<input value={value} placeholder={`Enter ${key.replaceAll("_", " ")}`} onChange={(e) => setProfile((current) => ({...current,[key]:e.target.value}))} className={`${field} mt-2`} required={["username","first_name","last_name","phone"].includes(key)}/></label>)}<button className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white">Save Profile</button></form>
    <form onSubmit={savePassword} className="space-y-4 rounded-3xl border bg-white p-6"><h2 className="font-serif text-xl font-bold">Update Password</h2><input type="password" placeholder="Current password" value={password.current_password} onChange={(e) => setPassword({...password,current_password:e.target.value})} className={field} required/><input type="password" placeholder="New password" value={password.password} onChange={(e) => setPassword({...password,password:e.target.value})} className={field} minLength={8} required/><input type="password" placeholder="Confirm new password" value={password.password_confirmation} onChange={(e) => setPassword({...password,password_confirmation:e.target.value})} className={field} minLength={8} required/><button className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white">Update Password</button></form>
    <form onSubmit={addStaff} className="space-y-4 rounded-3xl border bg-white p-6 lg:col-span-2"><h2 className="font-serif text-xl font-bold">Add Parish Staff</h2><div className="grid gap-4 sm:grid-cols-2">{Object.entries(newStaff).map(([key,value]) => <label key={key} className="block text-sm font-medium capitalize">{key.replaceAll("_"," ")}<input type={key.includes("password") ? "password" : "text"} value={value} placeholder={`Enter ${key.replaceAll("_", " ")}`} maxLength={key === "middle_initial" ? 1 : undefined} onChange={(e) => setNewStaff((current) => ({...current,[key]:e.target.value}))} className={`${field} mt-2`} required={key !== "middle_initial"}/></label>)}</div><button className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white">Create Staff Account</button></form></div>
  </div></StaffDashboardLayout>;
}
