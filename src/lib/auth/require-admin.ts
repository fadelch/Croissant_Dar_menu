import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/session";

export async function requireAdmin() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
