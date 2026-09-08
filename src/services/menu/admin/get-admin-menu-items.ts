import "server-only";

import { FieldPath } from "firebase-admin/firestore";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminCategories } from "@/services/categories/admin/get-admin-categories";
import { assertTrustedMenuAdmin } from "@/services/menu/admin/authorization";
import { MenuItemServiceError } from "@/services/menu/admin/errors";
import { toAdminMenuItem } from "@/services/menu/admin/mapper";
import type {
  AdminMenuItemRow,
  MenuCategoryOption,
} from "@/services/menu/admin/types";

export type AdminMenuData = {
  items: AdminMenuItemRow[];
  categories: MenuCategoryOption[];
};

export async function getAdminMenuData(admin: AdminIdentity): Promise<AdminMenuData> {
  assertTrustedMenuAdmin(admin);

  try {
    const [menuSnapshot, categories] = await Promise.all([
      getAdminDb()
        .collection(FIRESTORE_COLLECTIONS.menuItems)
        .orderBy("sortOrder", "asc")
        .orderBy(FieldPath.documentId(), "asc")
        .get(),
      getAdminCategories(admin),
    ]);
    const categoryMap = new Map<string, MenuCategoryOption>(
      categories.map((category) => [category.id, category]),
    );

    const items = menuSnapshot.docs.map((snapshot) => {
      const item = toAdminMenuItem(snapshot);

      if (!item) {
        throw new MenuItemServiceError("database");
      }

      return {
        ...item,
        category: categoryMap.get(item.categoryId) ?? null,
      };
    });

    return { items, categories };
  } catch (error) {
    if (error instanceof MenuItemServiceError) {
      throw error;
    }

    console.error("Unable to load administrator menu items.");
    throw new MenuItemServiceError("database");
  }
}
