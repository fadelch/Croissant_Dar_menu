import "server-only";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { assertTrustedMenuAdmin } from "@/services/menu/admin/authorization";
import { MenuItemServiceError } from "@/services/menu/admin/errors";
import { removeOwnedMenuItemImage } from "@/services/menu/admin/image-storage";

export async function deleteMenuItem(
  admin: AdminIdentity,
  menuItemId: string,
): Promise<void> {
  assertTrustedMenuAdmin(admin);
  const db = getAdminDb();
  const menuItemReference = db.collection(FIRESTORE_COLLECTIONS.menuItems).doc(menuItemId);
  let imageStoragePath: string | undefined;

  try {
    await db.runTransaction(async (transaction) => {
      const menuItem = await transaction.get(menuItemReference);

      if (!menuItem.exists) {
        throw new MenuItemServiceError("not-found");
      }

      const storedImagePath = menuItem.get("imageStoragePath");
      imageStoragePath = typeof storedImagePath === "string" ? storedImagePath : undefined;
      transaction.delete(menuItemReference);
    });
  } catch (error) {
    if (error instanceof MenuItemServiceError) {
      throw error;
    }

    console.error("Unable to delete a menu item.");
    throw new MenuItemServiceError("database");
  }

  await removeOwnedMenuItemImage(admin, menuItemId, imageStoragePath);
}
