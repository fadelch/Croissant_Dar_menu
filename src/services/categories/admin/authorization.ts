import "server-only";

import type { AdminIdentity } from "@/lib/auth/session";

export function assertTrustedAdmin(admin: AdminIdentity): void {
  if (!admin.uid) {
    throw new Error("A verified administrator identity is required.");
  }
}
