"use client";

import { TriangleAlert, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/api/errors";
import { ROLES, ROLE_LABELS, isRole, type Role } from "@/types";
import {
  useListUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from "../api/usersApi";

const PAGE_SIZE = 10;

// Phase 3 used useEffect + fetch here. Phase 4 replaced all of that with RTK Query:
// caching, request de-duplication, cancelling stale requests and refreshing after
// a change (tag invalidation) are now done by the library, not by hand.
export default function UsersTable({ currentUserId }: { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isFetching, error, refetch } = useListUsersQuery({
    page,
    pageSize: PAGE_SIZE,
    q: debouncedSearch.trim() || undefined,
    role: role || undefined,
  });
  const [updateRole] = useUpdateUserRoleMutation();
  const [updateStatus] = useUpdateUserStatusMutation();

  async function changeRole(id: string, name: string, next: Role) {
    try {
      await updateRole({ id, role: next }).unwrap();
      toast.success(`${name} is now ${next}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    }
  }

  async function changeStatus(id: string, name: string, isActive: boolean) {
    try {
      await updateStatus({ id, isActive }).unwrap();
      toast.success(isActive ? `${name} activated` : `${name} deactivated`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    }
  }

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

      {error && !data ? (
        <EmptyState
          icon={TriangleAlert}
          title="Could not load users"
          description={getErrorMessage(error)}
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void refetch()}>
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
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4}>
                        <div className="skeleton h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : data?.data.map((u) => {
                    const isMe = u.id === currentUserId;
                    return (
                      <tr key={u.id} className={isFetching ? "opacity-60" : undefined}>
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
                            onChange={(e) => {
                              if (isRole(e.target.value)) void changeRole(u.id, u.name, e.target.value);
                            }}
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
                            onChange={(e) => void changeStatus(u.id, u.name, e.target.checked)}
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
          {data && data.data.length === 0 && (
            <div className="p-6">
              <EmptyState icon={Users} title="No users found" description="Try a different search or role filter." />
            </div>
          )}
        </div>
      )}

      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} noun="users" onPageChange={setPage} />}
    </div>
  );
}
