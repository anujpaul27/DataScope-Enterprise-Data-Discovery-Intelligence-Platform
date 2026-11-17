import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { isRole, type AppUser, type Role } from "@/types";

/** Reads the session on the server. `cache` = at most one DB lookup per request. */
export const getServerSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);


export async function requireUser(): Promise<AppUser> {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const u = session.user;
  if (!u.isActive || !isRole(u.role)) redirect("/login");

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image ?? null,
    role: u.role,
  };
}

/** Same, but also checks the role. Wrong role = redirected to the dashboard home. */
export async function requireRole(...allowed: Role[]): Promise<AppUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) redirect("/dashboard");
  return user;
}
