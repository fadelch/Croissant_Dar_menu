"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { z } from "zod";

import {
  categoryFormFields,
  type CategoryActionState,
  type CategoryFormField,
} from "@/components/admin/categories/action-state";
import {
  AdminAuthorizationError,
  requireAdminAction,
} from "@/lib/auth/require-admin";
import {
  adminMutationLimiter,
  getClientIp,
  RateLimitUnavailableError,
} from "@/lib/rate-limit";
import {
  categoryIdSchema,
  categoryInputSchema,
  categoryUpdateSchema,
} from "@/lib/validations/category";
import { createCategory } from "@/services/categories/admin/create-category";
import { deleteCategory } from "@/services/categories/admin/delete-category";
import { CategoryServiceError } from "@/services/categories/admin/errors";
import { updateCategory } from "@/services/categories/admin/update-category";

const CATEGORY_FIELDS = new Set<string>(categoryFormFields);

type MutationAuthorization =
  | { success: true; admin: Awaited<ReturnType<typeof requireAdminAction>> }
  | { success: false; state: CategoryActionState };

function errorState(
  revision: number,
  code: Exclude<CategoryActionState["code"], "success" | undefined>,
  message: string,
  fieldErrors?: CategoryActionState["fieldErrors"],
): CategoryActionState {
  return { status: "error", code, message, fieldErrors, revision };
}

function optionalText(value: FormDataEntryValue | null): FormDataEntryValue | undefined {
  return typeof value === "string" && value.trim() === "" ? undefined : (value ?? undefined);
}

function formDataToCategoryInput(formData: FormData): Record<string, unknown> {
  const sortOrder = formData.get("sortOrder");

  return {
    nameAr: formData.get("nameAr"),
    nameEn: optionalText(formData.get("nameEn")),
    slug: formData.get("slug"),
    descriptionAr: optionalText(formData.get("descriptionAr")),
    descriptionEn: optionalText(formData.get("descriptionEn")),
    imageUrl: optionalText(formData.get("imageUrl")),
    isActive: formData.get("isActive") === "on",
    sortOrder:
      typeof sortOrder === "string" && sortOrder.trim() !== "" ? Number(sortOrder) : undefined,
  };
}

function hasUnknownFields(formData: FormData): boolean {
  return [...formData.keys()].some(
    (field) => !CATEGORY_FIELDS.has(field) && !field.startsWith("$ACTION_"),
  );
}

function validationErrorState(
  revision: number,
  error: z.ZodError,
): CategoryActionState {
  const fieldErrors: Partial<Record<CategoryFormField, string[]>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && CATEGORY_FIELDS.has(field)) {
      const categoryField = field as CategoryFormField;
      fieldErrors[categoryField] = [...(fieldErrors[categoryField] ?? []), issue.message];
    }
  }

  return errorState(
    revision,
    "validation",
    "Please correct the highlighted fields.",
    fieldErrors,
  );
}

async function authorizeMutation(revision: number): Promise<MutationAuthorization> {
  try {
    const admin = await requireAdminAction();
    const requestHeaders = await headers();
    const result = await adminMutationLimiter.limit(
      `admin:${admin.uid}:ip:${getClientIp({ headers: requestHeaders })}`,
    );

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

    return { success: true, admin };
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
          "Category changes are temporarily unavailable. Please try again.",
        ),
      };
    }

    throw error;
  }
}

function serviceErrorState(
  revision: number,
  error: unknown,
  fallbackMessage: string,
): CategoryActionState {
  if (error instanceof CategoryServiceError) {
    if (error.code === "duplicate-slug") {
      return errorState(
        revision,
        "duplicate-slug",
        "A category with this slug already exists.",
        { slug: ["Choose a unique slug."] },
      );
    }

    if (error.code === "not-found") {
      return errorState(revision, "not-found", "This category no longer exists.");
    }

    if (error.code === "contains-menu-items") {
      return errorState(
        revision,
        "contains-menu-items",
        "This category contains menu items. Move or delete those items before deleting the category.",
      );
    }
  }

  return errorState(revision, "unavailable", fallbackMessage);
}

export async function createCategoryAction(
  previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const revision = previousState.revision + 1;
  const authorization = await authorizeMutation(revision);

  if (!authorization.success) {
    return authorization.state;
  }

  if (hasUnknownFields(formData)) {
    return errorState(revision, "validation", "The submitted category contains unknown fields.");
  }

  const result = categoryInputSchema.safeParse(formDataToCategoryInput(formData));

  if (!result.success) {
    return validationErrorState(revision, result.error);
  }

  try {
    await createCategory(authorization.admin, result.data);
    revalidatePath("/admin/categories");

    return {
      status: "success",
      code: "success",
      message: "Category created successfully.",
      revision,
    };
  } catch (error) {
    return serviceErrorState(revision, error, "Unable to create the category. Please try again.");
  }
}

export async function updateCategoryAction(
  categoryId: string,
  previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const revision = previousState.revision + 1;
  const authorization = await authorizeMutation(revision);

  if (!authorization.success) {
    return authorization.state;
  }

  const validId = categoryIdSchema.safeParse(categoryId);

  if (!validId.success) {
    return errorState(revision, "not-found", "This category does not exist.");
  }

  if (hasUnknownFields(formData)) {
    return errorState(revision, "validation", "The submitted category contains unknown fields.");
  }

  const result = categoryUpdateSchema.safeParse(formDataToCategoryInput(formData));

  if (!result.success) {
    return validationErrorState(revision, result.error);
  }

  try {
    await updateCategory(authorization.admin, validId.data, result.data);
    revalidatePath("/admin/categories");

    return {
      status: "success",
      code: "success",
      message: "Category updated successfully.",
      revision,
    };
  } catch (error) {
    return serviceErrorState(revision, error, "Unable to update the category. Please try again.");
  }
}

export async function toggleCategoryAction(
  categoryId: string,
  isActive: boolean,
): Promise<CategoryActionState> {
  const authorization = await authorizeMutation(1);

  if (!authorization.success) {
    return authorization.state;
  }

  const validId = categoryIdSchema.safeParse(categoryId);
  const validUpdate = categoryUpdateSchema.safeParse({ isActive });

  if (!validId.success || !validUpdate.success) {
    return errorState(1, "validation", "Invalid category status change.");
  }

  try {
    await updateCategory(authorization.admin, validId.data, validUpdate.data);
    revalidatePath("/admin/categories");

    return {
      status: "success",
      code: "success",
      message: "Category status updated successfully.",
      revision: 1,
    };
  } catch (error) {
    return serviceErrorState(1, error, "Unable to update the category status.");
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<CategoryActionState> {
  const authorization = await authorizeMutation(1);

  if (!authorization.success) {
    return authorization.state;
  }

  const validId = categoryIdSchema.safeParse(categoryId);

  if (!validId.success) {
    return errorState(1, "not-found", "This category does not exist.");
  }

  try {
    await deleteCategory(authorization.admin, validId.data);
    revalidatePath("/admin/categories");

    return {
      status: "success",
      code: "success",
      message: "Category deleted successfully.",
      revision: 1,
    };
  } catch (error) {
    return serviceErrorState(1, error, "Unable to delete the category. Please try again.");
  }
}
