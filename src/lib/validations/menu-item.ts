import { Timestamp } from "firebase/firestore";
import { z } from "zod";

import type { CreateMenuItemInput, MenuItemDocument, UpdateMenuItemInput } from "@/types/menu";

export const menuCategoryIdSchema = z.string().trim().min(1).max(128);
export const menuItemIdSchema = z.string().trim().min(1).max(1_500).regex(/^[^/]+$/);

export const lbpAmountSchema = z.number().finite().int().min(0).max(Number.MAX_SAFE_INTEGER);

const menuItemInputShape = {
  categoryId: menuCategoryIdSchema,
  nameAr: z.string().trim().min(1).max(120),
  nameEn: z.string().trim().min(1).max(120).optional(),
  descriptionAr: z.string().trim().min(1).max(1000).optional(),
  descriptionEn: z.string().trim().min(1).max(1000).optional(),
  price: lbpAmountSchema,
  imageUrl: z.string().trim().max(2048).url().optional(),
  imageStoragePath: z.string().trim().min(1).max(2048).optional(),
  isAvailable: z.boolean(),
  isVisible: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().finite().int().min(0),
};

export const menuItemInputSchema = z.strictObject(menuItemInputShape) satisfies z.ZodType<CreateMenuItemInput>;

export const menuItemUpdateSchema = menuItemInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, "At least one menu item field is required") satisfies z.ZodType<UpdateMenuItemInput>;

export const menuItemDocumentSchema = z.strictObject({
  ...menuItemInputShape,
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
}) satisfies z.ZodType<MenuItemDocument>;
