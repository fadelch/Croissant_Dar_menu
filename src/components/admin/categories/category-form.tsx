"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/(protected)/categories/actions";
import {
  initialCategoryActionState,
  type CategoryActionState,
  type CategoryFormField,
} from "@/components/admin/categories/action-state";
import {
  CATEGORY_IMAGE_MIME_TYPES,
  isCategoryImageMimeType,
  MAX_CATEGORY_IMAGE_BYTES,
  MAX_CATEGORY_IMAGE_LABEL,
} from "@/lib/uploads/category-image";

type CategoryFormValues = {
  id: string;
  nameEn: string;
  nameAr?: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
};

type CategoryFormProps =
  | { mode: "create"; category?: never }
  | { mode: "edit"; category: CategoryFormValues };

const inputClassName =
  "min-h-12 w-full rounded-2xl border border-brown-900/15 bg-white px-4 text-charcoal-950 outline-none transition focus:border-caramel-500 focus:ring-4 focus:ring-caramel-400/15 disabled:cursor-not-allowed disabled:opacity-60";
const textareaClassName = `${inputClassName} min-h-28 py-3`;

function FieldError({
  field,
  errors,
}: {
  field: CategoryFormField;
  errors: Partial<Record<CategoryFormField, string[]>> | undefined;
}) {
  const message = errors?.[field]?.[0];

  return message ? (
    <p id={`${field}-error`} className="mt-2 text-sm text-red-700">
      {message}
    </p>
  ) : null;
}

function responseMessage(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return null;
}

function responseImageUrl(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "imageUrl" in value &&
    typeof value.imageUrl === "string"
  ) {
    return value.imageUrl;
  }

  return null;
}

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const formReference = useRef<HTMLFormElement>(null);
  const fileInputReference = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<CategoryActionState>(initialCategoryActionState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(category?.imageUrl);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveCategory =
    mode === "create"
      ? createCategoryAction
      : updateCategoryAction.bind(null, category.id);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isCategoryImageMimeType(file.type)) {
      setSelectedFile(null);
      event.target.value = "";
      setImageError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_CATEGORY_IMAGE_BYTES) {
      setSelectedFile(null);
      event.target.value = "";
      setImageError(`The image must be ${MAX_CATEGORY_IMAGE_LABEL} or smaller.`);
      return;
    }

    setSelectedFile(file);
  }

  function removeImage() {
    setSelectedFile(null);
    setImageUrl(undefined);
    setImageError(null);

    if (fileInputReference.current) {
      fileInputReference.current.value = "";
    }
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImageError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    let nextImageUrl = imageUrl;

    try {
      if (selectedFile) {
        const uploadResponse = await fetch("/api/admin/category-images", {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          credentials: "same-origin",
          body: selectedFile,
        });
        const responseBody: unknown = await uploadResponse.json().catch(() => null);

        if (!uploadResponse.ok) {
          setImageError(responseMessage(responseBody) ?? "Unable to upload the image.");
          return;
        }

        const uploadedImageUrl = responseImageUrl(responseBody);

        if (!uploadedImageUrl) {
          setImageError("The image upload returned an invalid response.");
          return;
        }

        nextImageUrl = uploadedImageUrl;
        setImageUrl(uploadedImageUrl);
        setSelectedFile(null);

        if (fileInputReference.current) {
          fileInputReference.current.value = "";
        }
      }

      formData.set("imageUrl", nextImageUrl ?? "");
      const result = await saveCategory(state, formData);
      setState(result);

      if (mode === "create" && result.status === "success") {
        formReference.current?.reset();
        setImageUrl(undefined);
        setSelectedFile(null);
      }
    } catch {
      setImageError("Unable to upload or save the category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const errors = state.fieldErrors;
  const value = category;

  return (
    <form ref={formReference} onSubmit={submitCategory} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="nameEn" className="mb-2 block text-sm font-bold text-brown-900">
            English Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="nameEn"
            name="nameEn"
            required
            dir="ltr"
            defaultValue={value?.nameEn}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors?.nameEn)}
            aria-describedby={errors?.nameEn ? "nameEn-error" : undefined}
            className={inputClassName}
          />
          <FieldError field="nameEn" errors={errors} />
        </div>

        <div>
          <label htmlFor="nameAr" className="mb-2 block text-sm font-bold text-brown-900">
            Arabic Name <span className="font-normal text-brown-700">(optional)</span>
          </label>
          <input
            id="nameAr"
            name="nameAr"
            dir="rtl"
            defaultValue={value?.nameAr}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors?.nameAr)}
            aria-describedby={errors?.nameAr ? "nameAr-error" : undefined}
            className={inputClassName}
          />
          <FieldError field="nameAr" errors={errors} />
        </div>

        <div>
          <label htmlFor="slug" className="mb-2 block text-sm font-bold text-brown-900">
            Slug <span aria-hidden="true">*</span>
          </label>
          <input
            id="slug"
            name="slug"
            required
            dir="ltr"
            placeholder="hot-drinks"
            defaultValue={value?.slug}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors?.slug)}
            aria-describedby={errors?.slug ? "slug-error" : "slug-help"}
            className={inputClassName}
          />
          <p id="slug-help" className="mt-2 text-xs text-brown-700">
            Use words separated by single hyphens, for example: hot-drinks.
          </p>
          <FieldError field="slug" errors={errors} />
        </div>

        <div>
          <label htmlFor="sortOrder" className="mb-2 block text-sm font-bold text-brown-900">
            Display Order <span aria-hidden="true">*</span>
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            required
            dir="ltr"
            defaultValue={value?.sortOrder ?? 0}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors?.sortOrder)}
            aria-describedby={errors?.sortOrder ? "sortOrder-error" : undefined}
            className={inputClassName}
          />
          <FieldError field="sortOrder" errors={errors} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="descriptionEn" className="mb-2 block text-sm font-bold text-brown-900">
            English Description
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            dir="ltr"
            defaultValue={value?.descriptionEn}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors?.descriptionEn)}
            aria-describedby={errors?.descriptionEn ? "descriptionEn-error" : undefined}
            className={textareaClassName}
          />
          <FieldError field="descriptionEn" errors={errors} />
        </div>

        <div>
          <label htmlFor="descriptionAr" className="mb-2 block text-sm font-bold text-brown-900">
            Arabic Description
          </label>
          <textarea
            id="descriptionAr"
            name="descriptionAr"
            dir="rtl"
            defaultValue={value?.descriptionAr}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors?.descriptionAr)}
            aria-describedby={errors?.descriptionAr ? "descriptionAr-error" : undefined}
            className={textareaClassName}
          />
          <FieldError field="descriptionAr" errors={errors} />
        </div>
      </div>

      <div className="rounded-2xl border border-brown-900/10 bg-cream-50 p-4">
        <p className="text-sm font-bold text-brown-900">Category Image</p>
        <p id="category-image-help" className="mt-1 text-xs leading-5 text-brown-700">
          Choose a JPEG, PNG, or WebP image from your computer. Maximum size: {MAX_CATEGORY_IMAGE_LABEL}.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputReference}
            id="categoryImage"
            type="file"
            accept={CATEGORY_IMAGE_MIME_TYPES.join(",")}
            onChange={chooseImage}
            disabled={isSubmitting}
            aria-describedby="category-image-help category-image-status"
            className="sr-only"
          />
          <label
            htmlFor="categoryImage"
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-caramel-500 px-5 text-sm font-bold text-white transition hover:bg-brown-900 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-caramel-500"
          >
            Choose Image
          </label>
          {selectedFile || imageUrl ? (
            <button
              type="button"
              onClick={removeImage}
              disabled={isSubmitting}
              className="min-h-11 rounded-full border border-red-700/20 bg-red-50 px-4 text-sm font-bold text-red-800 disabled:opacity-60"
            >
              Remove Image
            </button>
          ) : null}
        </div>

        <p id="category-image-status" className="mt-3 break-all text-sm text-brown-700">
          {selectedFile?.name ?? (imageUrl ? "An uploaded image is saved for this category." : "No image selected.")}
        </p>
        <input type="hidden" name="imageUrl" value={imageUrl ?? ""} readOnly />

        {imageError ? (
          <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {imageError}
          </p>
        ) : null}
        <FieldError field="imageUrl" errors={errors} />
      </div>

      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-brown-900/10 bg-cream-50 px-4 font-bold text-brown-900">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={value?.isActive ?? true}
          disabled={isSubmitting}
          className="size-5 accent-caramel-500"
        />
        Active and visible to public category queries
      </label>

      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 rounded-2xl bg-brown-900 px-6 font-bold text-cream-50 shadow-lg shadow-brown-900/15 transition hover:bg-charcoal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? selectedFile
            ? "Uploading…"
            : "Saving…"
          : mode === "create"
            ? "Create Category"
            : "Save Changes"}
      </button>
    </form>
  );
}
