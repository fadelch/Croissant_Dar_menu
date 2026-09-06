import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { adminDocumentSchema } from "@/lib/validations/admin";
import { categoryDocumentSchema } from "@/lib/validations/category";
import { menuItemDocumentSchema } from "@/lib/validations/menu-item";
import type { Admin } from "@/types/admin";
import type { Category } from "@/types/category";
import type { MenuItem } from "@/types/menu";

type FirestoreSnapshot = QueryDocumentSnapshot<DocumentData, DocumentData>;

export function toAdmin(snapshot: FirestoreSnapshot): Admin {
  const data = adminDocumentSchema.parse(snapshot.data());

  return { uid: snapshot.id, ...data };
}

export function toCategory(snapshot: FirestoreSnapshot): Category {
  const data = categoryDocumentSchema.parse(snapshot.data());

  return { id: snapshot.id, ...data };
}

export function toMenuItem(snapshot: FirestoreSnapshot): MenuItem {
  const data = menuItemDocumentSchema.parse(snapshot.data());

  return { id: snapshot.id, ...data };
}
