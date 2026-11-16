"use client";

import { TriangleAlert, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import { ApiError, apiFetch } from "@/lib/api/client";
import { ROLES, ROLE_LABELS, isRole, type ManagedUser, type Paginated, type Role } from "@/types";
import { useDebouncedValue } from "../useDebouncedValue";

const PAGE_SIZE = 10;

// NOTE: plain useEffect + fetch on purpose. In Phase 4 this whole file's data
// logic is replaced by an RTK Query hook (caching, deduplication, invalidation).
export default function UsersTable({ currentUserId }: { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const [result, setResult] = useState<Paginated<ManagedUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (role) params.set("role", role);
    try {
      setResult(await apiFetch<Paginated<ManagedUser>>(`/api/users?${params}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cannot reach the API.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function patch(user: ManagedUser, path: "role" | "status", body: object, okMessage: string) {
    try {
      await apiFetch(`/api/users/${user.id}/${path}`, { method: "PATCH", body: JSON.stringify(body) });
      toast.success(okMessage);
      await load(); // re-read from the server so the table is never out of sync
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          className="input input-bordered input-sm w-full sm:w-72"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Search users"
        />
        <select
          className="select select-bordered select-sm"
          value={role}
          onChange={(e) => {
            setRole(isRole(e.target.value) ? e.target.value : "");
            setPage(1);
          }}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <EmptyState
          icon={TriangleAlert}
          title="Could not load users"
          description={error}
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void load()}>
              Retry
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Active</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading && !result
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4}>
                        <div className="skeleton h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : result?.data.map((u) => {
                    const isMe = u.id === currentUserId;
                    return (
                      <tr key={u.id} className={loading ? "opacity-60" : undefined}>
                        <td>
                          <div className="font-medium">
                            {u.name} {isMe && <span className="badge badge-ghost badge-sm ml-1">You</span>}
                          </div>
                          <div className="text-xs text-base-content/60">{u.email}</div>
                        </td>
                        <td>
                          <select
                            className="select select-bordered select-xs"
                            value={u.role}
                            disabled={isMe}
                            aria-label={`Role for ${u.name}`}
                            onChange={(e) =>
                              void patch(u, "role", { role: e.target.value }, `${u.name} is now ${e.target.value}`)
                            }
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            className="toggle toggle-sm toggle-primary"
                            checked={u.isActive}
                            disabled={isMe}
                            aria-label={`Active status for ${u.name}`}
                            onChange={(e) =>
                              void patch(
                                u,
                                "status",
                                { isActive: e.target.checked },
                                e.target.checked ? `${u.name} activated` : `${u.name} deactivated`,
                              )
                            }
                          />
                        </td>
                        <td className="tabular text-sm text-base-content/70">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {result && result.data.length === 0 && (
            <div className="p-6">
              <EmptyState icon={Users} title="No users found" description="Try a different search or role filter." />
            </div>
          )}
        </div>
      )}

      {result && result.total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-base-content/60">{result.total} users</span>
          <div className="join">
            <button type="button" className="btn btn-sm join-item" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span className="btn btn-sm join-item pointer-events-none">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-sm join-item"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
