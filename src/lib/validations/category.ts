import { Timestamp } from "firebase/firestore";
import { z } from "zod";

import type { CategoryDocument, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

export const categoryIdSchema = z.string().trim().min(1).max(1_500).regex(/^[^/]+$/);

const categoryInputShape = {
  nameEn: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().min(1).max(120).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(100)
    .regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u, "Slug must contain words separated by single hyphens"),
  descriptionAr: z.string().trim().min(1).max(1000).optional(),
  descriptionEn: z.string().trim().min(1).max(1000).optional(),
  imageUrl: z.string().trim().max(2048).url().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().finite().int().min(0),
};

export const categoryInputSchema = z.strictObject(categoryInputShape) satisfies z.ZodType<CreateCategoryInput>;

export const categoryUpdateSchema = categoryInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, "At least one category field is required") satisfies z.ZodType<UpdateCategoryInput>;

export const categoryDocumentSchema = z.strictObject({
  ...categoryInputShape,
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
}) satisfies z.ZodType<CategoryDocument>;
