export const menuItemFormFields = [
  "categoryId",
  "nameAr",
  "nameEn",
  "descriptionAr",
  "descriptionEn",
  "price",
  "imageFile",
  "removeImage",
  "isAvailable",
  "isVisible",
  "isFeatured",
  "sortOrder",
] as const;

export type MenuItemFormField = (typeof menuItemFormFields)[number];

export type MenuItemActionCode =
  | "success"
  | "validation"
  | "not-found"
  | "category-not-found"
  | "invalid-image"
  | "rate-limited"
  | "unauthorized"
  | "unavailable";

export type MenuItemActionState = {
  status: "idle" | "success" | "error";
  code?: MenuItemActionCode;
  message?: string;
  fieldErrors?: Partial<Record<MenuItemFormField, string[]>>;
  revision: number;
};

export const initialMenuItemActionState: MenuItemActionState = {
  status: "idle",
  revision: 0,
};
