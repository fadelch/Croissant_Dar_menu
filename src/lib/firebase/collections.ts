export const FIRESTORE_COLLECTIONS = {
  admins: "admins",
  categories: "categories",
  categorySlugs: "categorySlugs",
  menuItems: "menuItems",
} as const;

export type FirestoreCollectionName = (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS];
