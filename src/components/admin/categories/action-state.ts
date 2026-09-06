export const categoryFormFields = [
  "nameAr",
  "nameEn",
  "slug",
  "descriptionAr",
  "descriptionEn",
  "imageUrl",
  "isActive",
  "sortOrder",
] as const;

export type CategoryFormField = (typeof categoryFormFields)[number];
export type CategoryActionCode =
  | "success"
  | "validation"
  | "duplicate-slug"
  | "not-found"
  | "contains-menu-items"
  | "unauthorized"
  | "rate-limited"
  | "unavailable";

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  code?: CategoryActionCode;
  message?: string;
  fieldErrors?: Partial<Record<CategoryFormField, string[]>>;
  revision: number;
};

export const initialCategoryActionState: CategoryActionState = {
  status: "idle",
  revision: 0,
};
