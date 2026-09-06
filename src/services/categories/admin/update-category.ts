import "server-only";

import { FieldValue, type UpdateData } from "firebase-admin/firestore";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { assertTrustedAdmin } from "@/services/categories/admin/authorization";
import { CategoryServiceError } from "@/services/categories/admin/errors";
import type { CategoryDocument, UpdateCategoryInput } from "@/types/category";

function toFirestoreUpdate(input: UpdateCategoryInput): UpdateData<CategoryDocument> {
  const update: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(input)) {
    update[field] = value === undefined ? FieldValue.delete() : value;
  }

  update.updatedAt = FieldValue.serverTimestamp();

  return update as UpdateData<CategoryDocument>;
}

export async function updateCategory(
  admin: AdminIdentity,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<void> {
  assertTrustedAdmin(admin);

  const db = getAdminDb();
  const categories = db.collection(FIRESTORE_COLLECTIONS.categories);
  const categoryReference = categories.doc(categoryId);

  try {
    await db.runTransaction(async (transaction) => {
      const currentCategory = await transaction.get(categoryReference);

      if (!currentCategory.exists) {
        throw new CategoryServiceError("not-found");
      }

      if (input.slug !== undefined) {
        const currentSlug = currentCategory.get("slug");
        const newSlugReference = db
          .collection(FIRESTORE_COLLECTIONS.categorySlugs)
          .doc(input.slug);
        const duplicateSlug = await transaction.get(
          categories.where("slug", "==", input.slug).limit(2),
        );
        const newSlugReservation = await transaction.get(newSlugReference);
        const oldSlugReference =
          typeof currentSlug === "string"
            ? db.collection(FIRESTORE_COLLECTIONS.categorySlugs).doc(currentSlug)
            : null;
        const oldSlugReservation =
          oldSlugReference && oldSlugReference.path !== newSlugReference.path
            ? await transaction.get(oldSlugReference)
            : null;
        const belongsToAnotherCategory = duplicateSlug.docs.some(
          (document) => document.id !== categoryId,
        );
        const reservedByAnotherCategory =
          newSlugReservation.exists && newSlugReservation.get("categoryId") !== categoryId;

        if (belongsToAnotherCategory || reservedByAnotherCategory) {
          throw new CategoryServiceError("duplicate-slug");
        }

        if (!newSlugReservation.exists) {
          transaction.create(newSlugReference, { categoryId });
        }

        if (oldSlugReference && oldSlugReservation?.get("categoryId") === categoryId) {
          transaction.delete(oldSlugReference);
        }
      }

      transaction.update(categoryReference, toFirestoreUpdate(input));
    });
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      throw error;
    }

    console.error("Unable to update category.");
    throw new CategoryServiceError("database");
  }
}
