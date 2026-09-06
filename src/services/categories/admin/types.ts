import "server-only";

import type { Category } from "@/types/category";

export type AdminCategory = Omit<Category, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};
