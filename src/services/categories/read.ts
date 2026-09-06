import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { toCategory } from "@/lib/firebase/converters";
import type { Category } from "@/types/category";

export async function getActiveCategories(): Promise<Category[]> {
  const categoriesQuery = query(
    collection(db, FIRESTORE_COLLECTIONS.categories),
    where("isActive", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snapshot = await getDocs(categoriesQuery);

  return snapshot.docs.map(toCategory);
}
