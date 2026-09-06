import "server-only";

import type { DocumentSnapshot } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";

import { categoryDocumentSchema } from "@/lib/validations/category";
import type { AdminCategory } from "@/services/categories/admin/types";

function toClientTimestamp(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    "nanoseconds" in value &&
    typeof value.seconds === "number" &&
    typeof value.nanoseconds === "number"
  ) {
    return new Timestamp(value.seconds, value.nanoseconds);
  }

  return value;
}

export function toAdminCategory(snapshot: DocumentSnapshot): AdminCategory | null {
  if (!snapshot.exists) {
    return null;
  }

  const rawData = snapshot.data();
  const data = categoryDocumentSchema.parse({
    ...rawData,
    createdAt: toClientTimestamp(rawData?.createdAt),
    updatedAt: toClientTimestamp(rawData?.updatedAt),
  });

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}
