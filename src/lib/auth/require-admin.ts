import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/session";
import type { AdminIdentity } from "@/lib/auth/session";

export class AdminAuthorizationError extends Error {
  constructor() {
    super("Administrator authorization is required.");
    this.name = "AdminAuthorizationError";
  }
}

export async function requireAdminAction(): Promise<AdminIdentity> {
  const admin = await getAdminSession();

  if (!admin) {
    throw new AdminAuthorizationError();
  }

  return admin;
}

export async function requireAdmin() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
