"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { z } from "zod";

import {
  menuItemFormFields,
  type MenuItemActionState,
  type MenuItemFormField,
} from "@/components/admin/menu/action-state";
import {
  AdminAuthorizationError,
  requireAdminAction,
} from "@/lib/auth/require-admin";
import {
  adminMutationLimiter,
  getClientIp,
  RateLimitUnavailableError,
  uploadLimiter,
} from "@/lib/rate-limit";
import {
  isMenuItemImageMimeType,
  MAX_MENU_ITEM_IMAGE_BYTES,
  MAX_MENU_ITEM_IMAGE_LABEL,
} from "@/lib/uploads/menu-item-image";
import {
  menuItemIdSchema,
  menuItemInputSchema,
  menuItemUpdateSchema,
} from "@/lib/validations/menu-item";
import {
  createMenuItem,
  type CreateMenuItemFields,
} from "@/services/menu/admin/create-menu-item";
import { deleteMenuItem } from "@/services/menu/admin/delete-menu-item";
import {
  MenuItemImageError,
  MenuItemServiceError,
} from "@/services/menu/admin/errors";
import {
  updateMenuItem,
  type UpdateMenuItemFields,
} from "@/services/menu/admin/update-menu-item";
import type { CreateMenuItemInput, UpdateMenuItemInput } from "@/types/menu";

const MENU_ITEM_FIELDS = new Set<string>(menuItemFormFields);

type MutationAuthorization =
  | {
      success: true;
      admin: Awaited<ReturnType<typeof requireAdminAction>>;
      uploadIdentifier: string;
    }
  | { success: false; state: MenuItemActionState };

function errorState(
  revision: number,
  code: Exclude<MenuItemActionState["code"], "success" | undefined>,
  message: string,
  fieldErrors?: MenuItemActionState["fieldErrors"],
): MenuItemActionState {
  return { status: "error", code, message, fieldErrors, revision };
}

function optionalText(value: FormDataEntryValue | null): FormDataEntryValue | undefined {
  return typeof value === "string" && value.trim() === "" ? undefined : (value ?? undefined);
}

function explicitNumber(value: FormDataEntryValue | null): number | undefined {
  return typeof value === "string" && value.trim() !== "" ? Number(value) : undefined;
}

function formDataToMenuItemInput(formData: FormData): Record<string, unknown> {
  return {
    categoryId: formData.get("categoryId"),
    nameAr: formData.get("nameAr"),
    nameEn: optionalText(formData.get("nameEn")),
    descriptionAr: optionalText(formData.get("descriptionAr")),
    descriptionEn: optionalText(formData.get("descriptionEn")),
    price: explicitNumber(formData.get("price")),
    isAvailable: formData.get("isAvailable") === "on",
    isVisible: formData.get("isVisible") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: explicitNumber(formData.get("sortOrder")),
  };
}

function getImageFile(formData: FormData): File | undefined {
  const value = formData.get("imageFile");
  return value instanceof File && value.size > 0 ? value : undefined;
}

function hasUnknownFields(formData: FormData): boolean {
  return [...formData.keys()].some(
    (field) => !MENU_ITEM_FIELDS.has(field) && !field.startsWith("$ACTION_"),
  );
}

function withoutImageReferences(input: CreateMenuItemInput): CreateMenuItemFields;
function withoutImageReferences(input: UpdateMenuItemInput): UpdateMenuItemFields;
function withoutImageReferences(
  input: CreateMenuItemInput | UpdateMenuItemInput,
): CreateMenuItemFields | UpdateMenuItemFields {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([field]) => field !== "imageUrl" && field !== "imageStoragePath",
    ),
  ) as CreateMenuItemFields | UpdateMenuItemFields;
}

function validationErrorState(
  revision: number,
  error: z.ZodError,
): MenuItemActionState {
  const fieldErrors: Partial<Record<MenuItemFormField, string[]>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && MENU_ITEM_FIELDS.has(field)) {
      const menuField = field as MenuItemFormField;
      fieldErrors[menuField] = [...(fieldErrors[menuField] ?? []), issue.message];
    }
  }

  return errorState(
    revision,
    "validation",
    "Please correct the highlighted fields.",
    fieldErrors,
  );
}

function validateImageFile(
  revision: number,
  image: File | undefined,
): MenuItemActionState | null {
  if (!image) {
    return null;
  }

  if (image.size > MAX_MENU_ITEM_IMAGE_BYTES) {
    return errorState(
      revision,
      "invalid-image",
      `The image must be ${MAX_MENU_ITEM_IMAGE_LABEL} or smaller.`,
      { imageFile: [`Maximum image size is ${MAX_MENU_ITEM_IMAGE_LABEL}.`] },
    );
  }

  if (!isMenuItemImageMimeType(image.type)) {
    return errorState(
      revision,
      "invalid-image",
      "Choose a JPEG, PNG, or WebP image.",
      { imageFile: ["Unsupported image type."] },
    );
  }

  return null;
}

async function authorizeMutation(revision: number): Promise<MutationAuthorization> {
  try {
    const admin = await requireAdminAction();
    const requestHeaders = await headers();
    const identifier = `admin:${admin.uid}:ip:${getClientIp({ headers: requestHeaders })}`;
    const result = await adminMutationLimiter.limit(identifier);

    if (!result.success) {
      return {
        success: false,
        state: errorState(
          revision,
          "rate-limited",
          "Too many changes were submitted. Please wait a moment and try again.",
        ),
      };
    }

    return { success: true, admin, uploadIdentifier: identifier };
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return {
        success: false,
        state: errorState(revision, "unauthorized", "Your admin session has expired."),
      };
    }

    if (error instanceof RateLimitUnavailableError) {
      return {
        success: false,
        state: errorState(
          revision,
          "unavailable",
          "Menu changes are temporarily unavailable. Please try again.",
        ),
      };
    }

    throw error;
  }
}

async function authorizeImageUpload(
  revision: number,
  identifier: string,
): Promise<MenuItemActionState | null> {
  try {
    const result = await uploadLimiter.limit(identifier);

    return result.success
      ? null
      : errorState(
          revision,
          "rate-limited",
          "Too many images were uploaded. Please wait before trying again.",
        );
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) {
      return errorState(
        revision,
        "unavailable",
        "Image uploads are temporarily unavailable. Please try again.",
      );
    }

    throw error;
  }
}

function serviceErrorState(
  revision: number,
  error: unknown,
  fallbackMessage: string,
): MenuItemActionState {
  if (error instanceof MenuItemServiceError) {
    if (error.code === "not-found") {
      return errorState(revision, "not-found", "This menu item no longer exists.");
    }

    if (error.code === "category-not-found") {
      return errorState(
        revision,
        "category-not-found",
        "The selected category no longer exists.",
        { categoryId: ["Choose an existing category."] },
      );
    }
  }

  if (error instanceof MenuItemImageError) {
    if (error.code === "too-large") {
      return errorState(
        revision,
        "invalid-image",
        `The image must be ${MAX_MENU_ITEM_IMAGE_LABEL} or smaller.`,
        { imageFile: [`Maximum image size is ${MAX_MENU_ITEM_IMAGE_LABEL}.`] },
      );
    }

    if (error.code === "unsupported-type" || error.code === "invalid-content") {
      return errorState(
        revision,
        "invalid-image",
        "The selected file is not a valid JPEG, PNG, or WebP image.",
        { imageFile: ["Choose a valid supported image."] },
      );
    }

    return errorState(
      revision,
      "unavailable",
      "The image could not be stored. Please try again.",
    );
  }

  return errorState(revision, "unavailable", fallbackMessage);
}

export async function createMenuItemAction(
  previousState: MenuItemActionState,
  formData: FormData,
): Promise<MenuItemActionState> {
  const revision = previousState.revision + 1;
  const authorization = await authorizeMutation(revision);

  if (!authorization.success) {
    return authorization.state;
  }

  if (hasUnknownFields(formData)) {
    return errorState(revision, "validation", "The submitted menu item contains unknown fields.");
  }

  const result = menuItemInputSchema.safeParse(formDataToMenuItemInput(formData));

  if (!result.success) {
    return validationErrorState(revision, result.error);
  }

  const image = getImageFile(formData);
  const imageError = validateImageFile(revision, image);

  if (imageError) {
    return imageError;
  }

  if (image) {
    const uploadAuthorization = await authorizeImageUpload(
      revision,
      authorization.uploadIdentifier,
    );

    if (uploadAuthorization) {
      return uploadAuthorization;
    }
  }

  try {
    await createMenuItem(authorization.admin, withoutImageReferences(result.data), image);
    revalidatePath("/admin/menu");

    return {
      status: "success",
      code: "success",
      message: "Menu item created successfully.",
      revision,
    };
  } catch (error) {
    return serviceErrorState(revision, error, "Unable to create the menu item. Please try again.");
  }
}

export async function updateMenuItemAction(
  menuItemId: string,
  previousState: MenuItemActionState,
  formData: FormData,
): Promise<MenuItemActionState> {
  const revision = previousState.revision + 1;
  const authorization = await authorizeMutation(revision);

  if (!authorization.success) {
    return authorization.state;
  }

  const validId = menuItemIdSchema.safeParse(menuItemId);

  if (!validId.success) {
    return errorState(revision, "not-found", "This menu item does not exist.");
  }

  if (hasUnknownFields(formData)) {
    return errorState(revision, "validation", "The submitted menu item contains unknown fields.");
  }

  const result = menuItemUpdateSchema.safeParse(formDataToMenuItemInput(formData));

  if (!result.success) {
    return validationErrorState(revision, result.error);
  }

  const image = getImageFile(formData);
  const imageError = validateImageFile(revision, image);

  if (imageError) {
    return imageError;
  }

  if (image) {
    const uploadAuthorization = await authorizeImageUpload(
      revision,
      authorization.uploadIdentifier,
    );

    if (uploadAuthorization) {
      return uploadAuthorization;
    }
  }

  try {
    await updateMenuItem(
      authorization.admin,
      validId.data,
      withoutImageReferences(result.data),
      { image, removeImage: formData.get("removeImage") === "on" },
    );
    revalidatePath("/admin/menu");
    revalidatePath(`/admin/menu/${validId.data}/edit`);

    return {
      status: "success",
      code: "success",
      message: "Menu item updated successfully.",
      revision,
    };
  } catch (error) {
    return serviceErrorState(revision, error, "Unable to update the menu item. Please try again.");
  }
}

async function updateBooleanStatus(
  menuItemId: string,
  field: "isAvailable" | "isVisible" | "isFeatured",
  value: boolean,
): Promise<MenuItemActionState> {
  const authorization = await authorizeMutation(1);

  if (!authorization.success) {
    return authorization.state;
  }

  const validId = menuItemIdSchema.safeParse(menuItemId);
  const validUpdate = menuItemUpdateSchema.safeParse({ [field]: value });

  if (!validId.success || !validUpdate.success) {
    return errorState(1, "validation", "Invalid menu item status change.");
  }

  try {
    await updateMenuItem(
      authorization.admin,
      validId.data,
      withoutImageReferences(validUpdate.data),
    );
    revalidatePath("/admin/menu");

    return {
      status: "success",
      code: "success",
      message: "Menu item status updated successfully.",
      revision: 1,
    };
  } catch (error) {
    return serviceErrorState(1, error, "Unable to update the menu item status.");
  }
}

export async function toggleAvailabilityAction(menuItemId: string, value: boolean) {
  return updateBooleanStatus(menuItemId, "isAvailable", value);
}

export async function toggleVisibilityAction(menuItemId: string, value: boolean) {
  return updateBooleanStatus(menuItemId, "isVisible", value);
}

export async function toggleFeaturedAction(menuItemId: string, value: boolean) {
  return updateBooleanStatus(menuItemId, "isFeatured", value);
}

export async function deleteMenuItemAction(menuItemId: string): Promise<MenuItemActionState> {
  const authorization = await authorizeMutation(1);

  if (!authorization.success) {
    return authorization.state;
  }

  const validId = menuItemIdSchema.safeParse(menuItemId);

  if (!validId.success) {
    return errorState(1, "not-found", "This menu item does not exist.");
  }

  try {
    await deleteMenuItem(authorization.admin, validId.data);
    revalidatePath("/admin/menu");

    return {
      status: "success",
      code: "success",
      message: "Menu item deleted successfully.",
      revision: 1,
    };
  } catch (error) {
    return serviceErrorState(1, error, "Unable to delete the menu item. Please try again.");
  }
}
