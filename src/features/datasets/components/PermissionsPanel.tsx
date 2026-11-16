"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import RoleBadge from "@/components/ui/RoleBadge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/api/errors";
import { useListUsersQuery } from "@/features/users/api/usersApi";
import {
  useListDatasetPermissionsQuery,
  useRemoveDatasetPermissionMutation,
  useSetDatasetPermissionMutation,
} from "../api/datasetsApi";
import { PERMISSION_LEVELS, type PermissionLevel } from "../types";

// Admin only (the page that shows it checks the role, and the API refuses everybody else).
export default function PermissionsPanel({ datasetId }: { datasetId: string }) {
  const permissions = useListDatasetPermissionsQuery(datasetId);
  const [setPermission, { isLoading: saving }] = useSetDatasetPermissionMutation();
  const [removePermission] = useRemoveDatasetPermissionMutation();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<PermissionLevel>("read");
  const debounced = useDebouncedValue(search.trim(), 300);

  // Look up people by name or email. Nothing is requested before 2 characters.
  const candidates = useListUsersQuery(
    { page: 1, pageSize: 8, q: debounced },
    { skip: debounced.length < 2 },
  );

  const granted = useMemo(() => new Set(permissions.data?.map((p) => p.userId)), [permissions.data]);
  const available = (candidates.data?.data ?? []).filter((u) => u.role !== "admin" && !granted.has(u.id));

  async function grant(userId: string, name: string, next: PermissionLevel) {
    try {
      await setPermission({ datasetId, userId, level: next }).unwrap();
      toast.success(`${name} can now ${next} this dataset`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the permission"));
    }
  }

  async function revoke(userId: string, name: string) {
    try {
      await removePermission({ datasetId, userId }).unwrap();
      toast.success(`Access removed for ${name}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove the permission"));
    }
  }

  return (
    <section className="rounded-box border border-base-300 p-5">
      <h2 className="text-base font-semibold">Who can open this dataset</h2>
      <p className="mt-1 text-sm text-base-content/60">
        Administrators always can. Analysts and viewers need to be added here.
      </p>

      {/* add a person */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          className="input input-bordered input-sm w-full sm:w-72"
          placeholder="Find a person by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Find a person"
        />
        <select
          className="select select-bordered select-sm"
          value={level}
          onChange={(e) => setLevel(e.target.value as PermissionLevel)}
          aria-label="Access level to give"
        >
          {PERMISSION_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {debounced.length >= 2 && (
        <ul className="mt-2 divide-y divide-base-300 rounded-box border border-base-300">
          {candidates.isFetching && !candidates.data ? (
            <li className="p-3 text-sm text-base-content/60">Searching...</li>
          ) : available.length === 0 ? (
            <li className="p-3 text-sm text-base-content/60">No one to add for &quot;{debounced}&quot;.</li>
          ) : (
            available.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-base-content/60">{u.email}</p>
                </div>
                <button type="button" className="btn btn-primary btn-xs" disabled={saving} onClick={() => void grant(u.id, u.name, level)}>
                  <UserPlus className="size-3.5" /> Add
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {/* current permissions */}
      <div className="mt-5 overflow-x-auto rounded-box border border-base-300">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Person</th>
              <th>Role</th>
              <th>Access</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {permissions.isLoading ? (
              <tr>
                <td colSpan={4}>
                  <div className="skeleton h-6 w-full" />
                </td>
              </tr>
            ) : permissions.error && !permissions.data ? (
              <tr>
                <td colSpan={4} className="text-error">
                  {getErrorMessage(permissions.error)}{" "}
                  <button type="button" className="link" onClick={() => void permissions.refetch()}>
                    Retry
                  </button>
                </td>
              </tr>
            ) : permissions.data && permissions.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-base-content/60">
                  Nobody has been added yet.
                </td>
              </tr>
            ) : (
              permissions.data?.map((p) => (
                <tr key={p.userId}>
                  <td>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-base-content/60">{p.email}</div>
                  </td>
                  <td>
                    <RoleBadge role={p.role} />
                  </td>
                  <td>
                    <select
                      className="select select-bordered select-xs"
                      value={p.level}
                      aria-label={`Access level for ${p.name}`}
                      onChange={(e) => void grant(p.userId, p.name, e.target.value as PermissionLevel)}
                    >
                      {PERMISSION_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right">
                    <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => void revoke(p.userId, p.name)} aria-label={`Remove access for ${p.name}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
