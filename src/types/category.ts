import type { Timestamp } from "firebase/firestore";

export type Category = {
  id: string;
  nameAr: string;
  nameEn?: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CategoryDocument = Omit<Category, "id">;
export type CreateCategoryInput = Omit<CategoryDocument, "createdAt" | "updatedAt">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
