import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { toMenuItem } from "@/lib/firebase/converters";
import { menuCategoryIdSchema } from "@/lib/validations/menu-item";
import type { MenuItem } from "@/types/menu";

const menuItemsCollection = () => collection(db, FIRESTORE_COLLECTIONS.menuItems);

export async function getVisibleMenuItems(): Promise<MenuItem[]> {
  const menuItemsQuery = query(
    menuItemsCollection(),
    where("isVisible", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snapshot = await getDocs(menuItemsQuery);

  return snapshot.docs.map(toMenuItem);
}

export async function getVisibleMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  const validCategoryId = menuCategoryIdSchema.parse(categoryId);
  const menuItemsQuery = query(
    menuItemsCollection(),
    where("categoryId", "==", validCategoryId),
    where("isVisible", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snapshot = await getDocs(menuItemsQuery);

  return snapshot.docs.map(toMenuItem);
}

export async function getFeaturedMenuItems(): Promise<MenuItem[]> {
  const menuItemsQuery = query(
    menuItemsCollection(),
    where("isVisible", "==", true),
    where("isFeatured", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snapshot = await getDocs(menuItemsQuery);

  return snapshot.docs.map(toMenuItem);
}
