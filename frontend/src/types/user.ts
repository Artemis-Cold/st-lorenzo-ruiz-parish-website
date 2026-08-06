import type { Address } from "./address";

export interface User {
  id: number;

  parishioner_id: string;

  username: string;

  full_name: string;

  first_name: string;

  middle_name: string | null;

  last_name: string;

  suffix: string | null;

  phone: string;

  address: Address;

  birth_date: string;

  gender: string;

  profile_photo: string | null;

  role: "parishioner" | "staff" | "admin";

  phone_verified: boolean;

  created_at: string;
}