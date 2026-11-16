import type { Role } from "@/types";

export type PermissionLevel = "read" | "write" | "manage";
export type FieldType = "text" | "number" | "date" | "boolean" | "select";

export const PERMISSION_LEVELS: PermissionLevel[] = ["read", "write", "manage"];
export const FIELD_TYPES: FieldType[] = ["text", "number", "date", "boolean", "select"];

/** One card in the Dataset Library (GET /api/datasets). */
export interface DatasetSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  dataSource: string;
  totalRecords: number;
  fieldCount: number;
  level: PermissionLevel;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  isVisibleByDefault: boolean;
  position: number;
  options: string[] | null;
}

/** GET /api/datasets/:id */
export interface DatasetDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  dataSource: string;
  totalRecords: number;
  createdBy: string | null;
  level: PermissionLevel;
  createdAt: string;
  updatedAt: string;
  fields: DatasetField[];
}

export interface DatasetStats {
  datasets: number;
  totalRecords: number;
  categories: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface DatasetPermission {
  userId: string;
  name: string;
  email: string;
  role: Role;
  level: PermissionLevel;
  grantedAt: string;
}

export interface NewFieldInput {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export interface CreateDatasetInput {
  name: string;
  description?: string;
  category: string;
  dataSource: string;
  fields: NewFieldInput[];
}

export interface UpdateDatasetInput {
  name?: string;
  description?: string | null;
  category?: string;
  dataSource?: string;
}
