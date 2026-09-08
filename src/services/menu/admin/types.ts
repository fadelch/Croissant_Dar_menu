import "server-only";

import type { AdminCategory } from "@/services/categories/admin/types";
import type { MenuItem } from "@/types/menu";

export type AdminMenuItem = Omit<MenuItem, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

export type MenuCategoryOption = Pick<
  AdminCategory,
  "id" | "nameEn" | "nameAr" | "isActive"
>;

export type AdminMenuItemRow = AdminMenuItem & {
  category: MenuCategoryOption | null;
};
