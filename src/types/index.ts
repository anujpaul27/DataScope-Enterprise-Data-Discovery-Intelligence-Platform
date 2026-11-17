export const ROLES = ["admin", "analyst", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  analyst: "Data Analyst",
  viewer: "Viewer",
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
}

/** Shape the Express API sends for every error. */
export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface FormValues {
  email: string,
  password: string,
  name: string,
  image: any,
  user: any 
}
export interface FormValues2 {
  email: string,
  password: string,
  name: string,
  image: any,
  user: any 
}
