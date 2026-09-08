import type { Timestamp } from "firebase/firestore";

export type MenuItem = {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  imageUrl?: string;
  imageStoragePath?: string;
  isAvailable: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type MenuItemDocument = Omit<MenuItem, "id">;
export type CreateMenuItemInput = Omit<MenuItemDocument, "createdAt" | "updatedAt">;
export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;
