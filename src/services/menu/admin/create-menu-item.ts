import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { assertTrustedMenuAdmin } from "@/services/menu/admin/authorization";
import { MenuItemImageError, MenuItemServiceError } from "@/services/menu/admin/errors";
import {
  removeOwnedMenuItemImage,
  uploadMenuItemImage,
  type StoredMenuItemImage,
} from "@/services/menu/admin/image-storage";
import type { CreateMenuItemInput } from "@/types/menu";

export type CreateMenuItemFields = Omit<
  CreateMenuItemInput,
  "imageUrl" | "imageStoragePath"
>;

function withoutUndefinedValues(input: CreateMenuItemFields): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

export async function createMenuItem(
  admin: AdminIdentity,
  input: CreateMenuItemFields,
  image?: File,
): Promise<string> {
  assertTrustedMenuAdmin(admin);
  const db = getAdminDb();
  const menuItemReference = db.collection(FIRESTORE_COLLECTIONS.menuItems).doc();
  const categoryReference = db.collection(FIRESTORE_COLLECTIONS.categories).doc(input.categoryId);
  let uploadedImage: StoredMenuItemImage | undefined;

  try {
    const category = await categoryReference.get();

    if (!category.exists) {
      throw new MenuItemServiceError("category-not-found");
    }

    if (image) {
      uploadedImage = await uploadMenuItemImage(admin, menuItemReference.id, image);
    }

    await db.runTransaction(async (transaction) => {
      const currentCategory = await transaction.get(categoryReference);

      if (!currentCategory.exists) {
        throw new MenuItemServiceError("category-not-found");
      }

      transaction.create(menuItemReference, {
        ...withoutUndefinedValues(input),
        ...uploadedImage,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return menuItemReference.id;
  } catch (error) {
    if (uploadedImage) {
      await removeOwnedMenuItemImage(
        admin,
        menuItemReference.id,
        uploadedImage.imageStoragePath,
      );
    }

    if (error instanceof MenuItemServiceError || error instanceof MenuItemImageError) {
      throw error;
    }

    console.error("Unable to create a menu item.");
    throw new MenuItemServiceError("database");
  }
}
