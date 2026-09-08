import "server-only";

import { FieldValue, type UpdateData } from "firebase-admin/firestore";

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
import type { MenuItemDocument, UpdateMenuItemInput } from "@/types/menu";

export type UpdateMenuItemFields = Omit<
  UpdateMenuItemInput,
  "imageUrl" | "imageStoragePath"
>;

export type MenuItemImageChange = {
  image?: File;
  removeImage?: boolean;
};

function toFirestoreUpdate(input: UpdateMenuItemFields): UpdateData<MenuItemDocument> {
  const update: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(input)) {
    update[field] = value === undefined ? FieldValue.delete() : value;
  }

  update.updatedAt = FieldValue.serverTimestamp();

  return update as UpdateData<MenuItemDocument>;
}

export async function updateMenuItem(
  admin: AdminIdentity,
  menuItemId: string,
  input: UpdateMenuItemFields,
  imageChange: MenuItemImageChange = {},
): Promise<void> {
  assertTrustedMenuAdmin(admin);
  const db = getAdminDb();
  const menuItemReference = db.collection(FIRESTORE_COLLECTIONS.menuItems).doc(menuItemId);
  const categoryReference = input.categoryId
    ? db.collection(FIRESTORE_COLLECTIONS.categories).doc(input.categoryId)
    : null;
  let uploadedImage: StoredMenuItemImage | undefined;
  let oldImageStoragePath: string | undefined;

  try {
    const existingMenuItem = await menuItemReference.get();

    if (!existingMenuItem.exists) {
      throw new MenuItemServiceError("not-found");
    }

    if (categoryReference && !(await categoryReference.get()).exists) {
      throw new MenuItemServiceError("category-not-found");
    }

    if (imageChange.image) {
      uploadedImage = await uploadMenuItemImage(admin, menuItemId, imageChange.image);
    }

    await db.runTransaction(async (transaction) => {
      const currentMenuItem = await transaction.get(menuItemReference);

      if (!currentMenuItem.exists) {
        throw new MenuItemServiceError("not-found");
      }

      if (categoryReference) {
        const currentCategory = await transaction.get(categoryReference);

        if (!currentCategory.exists) {
          throw new MenuItemServiceError("category-not-found");
        }
      }

      const storedImagePath = currentMenuItem.get("imageStoragePath");
      oldImageStoragePath =
        typeof storedImagePath === "string" ? storedImagePath : undefined;
      const update = toFirestoreUpdate(input) as Record<string, unknown>;

      if (uploadedImage) {
        update.imageUrl = uploadedImage.imageUrl;
        update.imageStoragePath = uploadedImage.imageStoragePath;
      } else if (imageChange.removeImage) {
        update.imageUrl = FieldValue.delete();
        update.imageStoragePath = FieldValue.delete();
      }

      transaction.update(menuItemReference, update);
    });
  } catch (error) {
    if (uploadedImage) {
      await removeOwnedMenuItemImage(admin, menuItemId, uploadedImage.imageStoragePath);
    }

    if (error instanceof MenuItemServiceError || error instanceof MenuItemImageError) {
      throw error;
    }

    console.error("Unable to update a menu item.");
    throw new MenuItemServiceError("database");
  }

  if (
    oldImageStoragePath &&
    (uploadedImage || imageChange.removeImage) &&
    oldImageStoragePath !== uploadedImage?.imageStoragePath
  ) {
    await removeOwnedMenuItemImage(admin, menuItemId, oldImageStoragePath);
  }
}
