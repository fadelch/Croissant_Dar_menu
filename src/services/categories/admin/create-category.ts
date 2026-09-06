import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { assertTrustedAdmin } from "@/services/categories/admin/authorization";
import { CategoryServiceError } from "@/services/categories/admin/errors";
import type { CreateCategoryInput } from "@/types/category";

function withoutUndefinedValues(input: CreateCategoryInput): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

export async function createCategory(
  admin: AdminIdentity,
  input: CreateCategoryInput,
): Promise<string> {
  assertTrustedAdmin(admin);

  const db = getAdminDb();
  const categories = db.collection(FIRESTORE_COLLECTIONS.categories);
  const categoryReference = categories.doc();
  const slugReference = db
    .collection(FIRESTORE_COLLECTIONS.categorySlugs)
    .doc(input.slug);

  try {
    await db.runTransaction(async (transaction) => {
      const duplicateSlug = await transaction.get(
        categories.where("slug", "==", input.slug).limit(1),
      );
      const slugReservation = await transaction.get(slugReference);

      if (!duplicateSlug.empty || slugReservation.exists) {
        throw new CategoryServiceError("duplicate-slug");
      }

      transaction.create(categoryReference, {
        ...withoutUndefinedValues(input),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(slugReference, { categoryId: categoryReference.id });
    });

    return categoryReference.id;
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      throw error;
    }

    console.error("Unable to create category.");
    throw new CategoryServiceError("database");
  }
}
