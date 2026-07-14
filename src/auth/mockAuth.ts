// DEVELOPMENT-ONLY mock authentication. Real auth is not wired up; this stands
// in so the app renders with a signed-in user during development. No passwords,
// PINs, OTPs or secrets are involved.

import type { AppRole } from "./roles";

export interface AuthTenant {
  id: string;
  name: string;
  slug: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

export interface AuthSession {
  tenant: AuthTenant;
  user: AuthUser;
}

/** The default signed-in session used in development. */
export const MOCK_SESSION: AuthSession = {
  tenant: {
    id: "tnt_vjdesai",
    name: "V J Desai Family",
    slug: "vj-desai-family",
  },
  user: {
    id: "usr_kunal",
    name: "Kunal Desai",
    email: "kunal@vjdesai.com",
    role: "family_admin",
  },
};

/** Selectable demo users for previewing each role during development. */
export const MOCK_USERS: AuthUser[] = [
  { id: "usr_kunal", name: "Kunal Desai", email: "kunal@vjdesai.com", role: "family_admin" },
  { id: "usr_vijay", name: "Vijay Desai", email: "vijay@vjdesai.com", role: "reviewer" },
  { id: "usr_neha", name: "Neha Desai", email: "neha@vjdesai.com", role: "trader" },
  { id: "usr_accts", name: "Family Accountant", email: "accounts@vjdesai.com", role: "accountant" },
  { id: "usr_lata", name: "Lata Desai", email: "lata@vjdesai.com", role: "viewer" },
  { id: "usr_support", name: "Platform Support", email: "support@vjdesai.com", role: "developer_support" },
];
