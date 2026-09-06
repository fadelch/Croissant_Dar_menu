import "server-only";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { assertTrustedAdmin } from "@/services/categories/admin/authorization";
import { CategoryServiceError } from "@/services/categories/admin/errors";

export async function deleteCategory(
  admin: AdminIdentity,
  categoryId: string,
): Promise<void> {
  assertTrustedAdmin(admin);

  const db = getAdminDb();
  const categoryReference = db.collection(FIRESTORE_COLLECTIONS.categories).doc(categoryId);
  const menuItems = db
    .collection(FIRESTORE_COLLECTIONS.menuItems)
    .where("categoryId", "==", categoryId)
    .limit(1);

  try {
    await db.runTransaction(async (transaction) => {
      const category = await transaction.get(categoryReference);

      if (!category.exists) {
        throw new CategoryServiceError("not-found");
      }

      const relatedMenuItems = await transaction.get(menuItems);
      const slug = category.get("slug");
      const slugReference =
        typeof slug === "string"
          ? db.collection(FIRESTORE_COLLECTIONS.categorySlugs).doc(slug)
          : null;
      const slugReservation = slugReference
        ? await transaction.get(slugReference)
        : null;

      if (!relatedMenuItems.empty) {
        throw new CategoryServiceError("contains-menu-items");
      }

      transaction.delete(categoryReference);

      if (slugReference && slugReservation?.get("categoryId") === categoryId) {
        transaction.delete(slugReference);
      }
    });
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      throw error;
    }

    console.error("Unable to delete category.");
    throw new CategoryServiceError("database");
  }
}
