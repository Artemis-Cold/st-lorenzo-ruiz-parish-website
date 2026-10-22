import type { Address } from "./address";

export interface User {
  id: number;

  parishioner_id: string;

  username: string;

  full_name: string;

  first_name: string;

  middle_initial: string | null;

  last_name: string;

  suffix: string | null;

  phone: string;

  address: Address;

  birth_date: string | null;

  gender: string | null;

  profile_photo: string | null;
  profile_photo_url: string | null;

  role: "parishioner" | "staff" | "admin";
  permissions?: string[];
  is_active?: boolean;

  phone_verified: boolean;

  created_at: string;

  profile_completed: boolean;
}
