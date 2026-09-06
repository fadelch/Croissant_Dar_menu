import "server-only";

import { FieldPath } from "firebase-admin/firestore";

import type { AdminIdentity } from "@/lib/auth/session";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { assertTrustedAdmin } from "@/services/categories/admin/authorization";
import { CategoryServiceError } from "@/services/categories/admin/errors";
import { toAdminCategory } from "@/services/categories/admin/mapper";
import type { AdminCategory } from "@/services/categories/admin/types";

export async function getAdminCategories(admin: AdminIdentity): Promise<AdminCategory[]> {
  assertTrustedAdmin(admin);

  try {
    const snapshot = await getAdminDb()
      .collection(FIRESTORE_COLLECTIONS.categories)
      .orderBy("sortOrder", "asc")
      .orderBy(FieldPath.documentId(), "asc")
      .get();

    return snapshot.docs.map(toAdminCategory).filter((category) => category !== null);
  } catch {
    console.error("Unable to load administrator categories.");
    throw new CategoryServiceError("database");
  }
}

export async function getAdminCategory(
  admin: AdminIdentity,
  categoryId: string,
): Promise<AdminCategory | null> {
  assertTrustedAdmin(admin);

  try {
    const snapshot = await getAdminDb()
      .collection(FIRESTORE_COLLECTIONS.categories)
      .doc(categoryId)
      .get();

    return toAdminCategory(snapshot);
  } catch {
    console.error("Unable to load an administrator category.");
    throw new CategoryServiceError("database");
  }
}
