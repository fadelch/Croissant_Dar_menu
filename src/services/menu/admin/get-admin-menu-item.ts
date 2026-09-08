import "server-only";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { assertTrustedMenuAdmin } from "@/services/menu/admin/authorization";
import { MenuItemServiceError } from "@/services/menu/admin/errors";
import { toAdminMenuItem } from "@/services/menu/admin/mapper";
import type { AdminMenuItem } from "@/services/menu/admin/types";

export async function getAdminMenuItem(
  admin: AdminIdentity,
  menuItemId: string,
): Promise<AdminMenuItem | null> {
  assertTrustedMenuAdmin(admin);

  try {
    const snapshot = await getAdminDb()
      .collection(FIRESTORE_COLLECTIONS.menuItems)
      .doc(menuItemId)
      .get();

    return toAdminMenuItem(snapshot);
  } catch {
    console.error("Unable to load an administrator menu item.");
    throw new MenuItemServiceError("database");
  }
}
