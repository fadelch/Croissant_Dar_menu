"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createMenuItemAction,
  updateMenuItemAction,
} from "@/app/admin/(protected)/menu/actions";
import {
  initialMenuItemActionState,
  type MenuItemActionState,
  type MenuItemFormField,
} from "@/components/admin/menu/action-state";
import {
  isMenuItemImageMimeType,
  MAX_MENU_ITEM_IMAGE_BYTES,
  MAX_MENU_ITEM_IMAGE_LABEL,
  MENU_ITEM_IMAGE_MIME_TYPES,
} from "@/lib/uploads/menu-item-image";
import type {
  AdminMenuItem,
  MenuCategoryOption,
} from "@/services/menu/admin/types";

type MenuItemFormProps = {
  categories: MenuCategoryOption[];
} & (
  | { mode: "create"; item?: never }
  | { mode: "edit"; item: AdminMenuItem }
);

const inputClassName =
  "min-h-12 w-full rounded-2xl border border-brown-900/15 bg-white px-4 text-charcoal-950 outline-none transition focus:border-caramel-500 focus:ring-4 focus:ring-caramel-400/15 disabled:cursor-not-allowed disabled:opacity-60";
const textareaClassName = `${inputClassName} min-h-28 py-3`;

function FieldError({
  field,
  errors,
}: {
  field: MenuItemFormField;
  errors: Partial<Record<MenuItemFormField, string[]>> | undefined;
}) {
  const message = errors?.[field]?.[0];

  return message ? (
    <p id={`${field}-error`} className="mt-2 text-sm text-red-700">
      {message}
    </p>
  ) : null;
}

function categoryLabel(category: MenuCategoryOption): string {
  const arabicName = category.nameAr ? ` / ${category.nameAr}` : "";
  const inactive = category.isActive ? "" : " (Inactive)";
  return `${category.nameEn}${arabicName}${inactive}`;
}

export function MenuItemForm({ mode, item, categories }: MenuItemFormProps) {
  const formReference = useRef<HTMLFormElement>(null);
  const fileInputReference = useRef<HTMLInputElement>(null);
  const objectUrlReference = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(item?.imageUrl ?? null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [clientImageError, setClientImageError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [state, setState] = useState<MenuItemActionState>(initialMenuItemActionState);
  const [isPending, setIsPending] = useState(false);
  const saveMenuItem =
    mode === "create"
      ? createMenuItemAction
      : updateMenuItemAction.bind(null, item.id);

  useEffect(() => {
    return () => {
      if (objectUrlReference.current) {
        URL.revokeObjectURL(objectUrlReference.current);
      }
    };
  }, []);

  function clearObjectUrl() {
    if (objectUrlReference.current) {
      URL.revokeObjectURL(objectUrlReference.current);
      objectUrlReference.current = null;
    }
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setClientImageError(null);

    if (!file) {
      return;
    }

    if (!isMenuItemImageMimeType(file.type)) {
      event.target.value = "";
      setClientImageError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_MENU_ITEM_IMAGE_BYTES) {
      event.target.value = "";
      setClientImageError(`The image must be ${MAX_MENU_ITEM_IMAGE_LABEL} or smaller.`);
      return;
    }

    clearObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlReference.current = objectUrl;
    setPreviewUrl(objectUrl);
    setSelectedFileName(file.name);
    setRemoveImage(false);
  }

  function clearSelectedImage() {
    clearObjectUrl();
    setSelectedFileName(null);
    setPreviewUrl(removeImage ? null : (item?.imageUrl ?? null));
    setClientImageError(null);

    if (fileInputReference.current) {
      fileInputReference.current.value = "";
    }
  }

  function changeRemoveImage(checked: boolean) {
    setRemoveImage(checked);

    if (checked) {
      clearSelectedImage();
      setPreviewUrl(null);
    } else {
      setPreviewUrl(item?.imageUrl ?? null);
    }
  }

  async function submitMenuItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    try {
      const result = await saveMenuItem(state, new FormData(event.currentTarget));
      setState(result);

      if (mode === "create" && result.status === "success") {
        formReference.current?.reset();
        clearObjectUrl();
        setPreviewUrl(null);
        setSelectedFileName(null);
        setRemoveImage(false);
        setClientImageError(null);
      }
    } catch {
      setState({
        status: "error",
        code: "unavailable",
        message: "The menu item could not be saved. Please try again.",
        revision: state.revision + 1,
      });
    } finally {
      setIsPending(false);
    }
  }

  const errors = state.fieldErrors;
  const value = item;
  const selectedCategoryExists = categories.some(
    (category) => category.id === value?.categoryId,
  );

  return (
    <form ref={formReference} onSubmit={submitMenuItem} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="nameAr" className="mb-2 block text-sm font-bold text-brown-900">
            Arabic Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="nameAr"
            name="nameAr"
            required
            dir="rtl"
            defaultValue={value?.nameAr}
            disabled={isPending}
            aria-invalid={Boolean(errors?.nameAr)}
            aria-describedby={errors?.nameAr ? "nameAr-error" : undefined}
            className={inputClassName}
          />
          <FieldError field="nameAr" errors={errors} />
        </div>

        <div>
          <label htmlFor="nameEn" className="mb-2 block text-sm font-bold text-brown-900">
            English Name
          </label>
          <input
            id="nameEn"
            name="nameEn"
            dir="ltr"
            defaultValue={value?.nameEn}
            disabled={isPending}
            aria-invalid={Boolean(errors?.nameEn)}
            aria-describedby={errors?.nameEn ? "nameEn-error" : undefined}
            className={inputClassName}
          />
          <FieldError field="nameEn" errors={errors} />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-2 block text-sm font-bold text-brown-900">
          Category <span aria-hidden="true">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={value?.categoryId ?? ""}
          disabled={isPending || categories.length === 0}
          aria-invalid={Boolean(errors?.categoryId)}
          aria-describedby={errors?.categoryId ? "categoryId-error" : undefined}
          className={inputClassName}
        >
          <option value="" disabled>
            Select a category
          </option>
          {value && !selectedCategoryExists ? (
            <option value={value.categoryId} disabled>
              Missing category ({value.categoryId})
            </option>
          ) : null}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
        <FieldError field="categoryId" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="descriptionAr" className="mb-2 block text-sm font-bold text-brown-900">
            Arabic Description
          </label>
          <textarea
            id="descriptionAr"
            name="descriptionAr"
            dir="rtl"
            defaultValue={value?.descriptionAr}
            disabled={isPending}
            aria-invalid={Boolean(errors?.descriptionAr)}
            aria-describedby={errors?.descriptionAr ? "descriptionAr-error" : undefined}
            className={textareaClassName}
          />
          <FieldError field="descriptionAr" errors={errors} />
        </div>

        <div>
          <label htmlFor="descriptionEn" className="mb-2 block text-sm font-bold text-brown-900">
            English Description
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            dir="ltr"
            defaultValue={value?.descriptionEn}
            disabled={isPending}
            aria-invalid={Boolean(errors?.descriptionEn)}
            aria-describedby={errors?.descriptionEn ? "descriptionEn-error" : undefined}
            className={textareaClassName}
          />
          <FieldError field="descriptionEn" errors={errors} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-bold text-brown-900">
            Price in Lebanese Pounds <span aria-hidden="true">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            required
            dir="ltr"
            placeholder="35000"
            defaultValue={value?.price}
            disabled={isPending}
            aria-invalid={Boolean(errors?.price)}
            aria-describedby={errors?.price ? "price-error" : "price-help"}
            className={inputClassName}
          />
          <p id="price-help" className="mt-2 text-xs text-brown-700">
            Enter digits only. Example: 35000 displays as 35,000 L.L.
          </p>
          <FieldError field="price" errors={errors} />
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
            disabled={isPending}
            aria-invalid={Boolean(errors?.sortOrder)}
            aria-describedby={errors?.sortOrder ? "sortOrder-error" : undefined}
            className={inputClassName}
          />
          <FieldError field="sortOrder" errors={errors} />
        </div>
      </div>

      <fieldset className="grid gap-3 rounded-2xl border border-brown-900/10 bg-cream-50 p-4 sm:grid-cols-3">
        <legend className="px-2 text-sm font-bold text-brown-900">Status</legend>
        {[
          ["isAvailable", "Available", value?.isAvailable ?? true],
          ["isVisible", "Visible", value?.isVisible ?? true],
          ["isFeatured", "Featured", value?.isFeatured ?? false],
        ].map(([name, label, checked]) => (
          <label key={String(name)} className="flex min-h-11 items-center gap-3 font-bold text-brown-900">
            <input
              name={String(name)}
              type="checkbox"
              defaultChecked={Boolean(checked)}
              disabled={isPending}
              className="size-5 accent-caramel-500"
            />
            {String(label)}
          </label>
        ))}
      </fieldset>

      <section className="rounded-2xl border border-brown-900/10 bg-cream-50 p-4" aria-labelledby="menu-image-heading">
        <h2 id="menu-image-heading" className="text-sm font-bold text-brown-900">
          Product Image <span className="font-normal text-brown-700">(optional)</span>
        </h2>
        <p id="menu-image-help" className="mt-1 text-xs leading-5 text-brown-700">
          JPEG, PNG, or WebP. Maximum size: {MAX_MENU_ITEM_IMAGE_LABEL}.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-brown-900/10 bg-white text-xs text-brown-700">
            {previewUrl && !removeImage ? (
              <Image src={previewUrl} alt="Product image preview" fill sizes="96px" className="object-cover" />
            ) : (
              "No image"
            )}
          </div>

          <div>
            <input
              ref={fileInputReference}
              id="imageFile"
              name="imageFile"
              type="file"
              accept={MENU_ITEM_IMAGE_MIME_TYPES.join(",")}
              onChange={chooseImage}
              disabled={isPending}
              aria-describedby="menu-image-help imageFile-status"
              className="sr-only peer"
            />
            <div className="flex flex-wrap gap-3">
              <label
                htmlFor="imageFile"
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-caramel-500 px-5 text-sm font-bold text-white transition hover:bg-brown-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-caramel-500"
              >
                Choose Image
              </label>
              {selectedFileName ? (
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  disabled={isPending}
                  className="min-h-11 rounded-full border border-brown-900/15 bg-white px-4 text-sm font-bold text-brown-900 disabled:opacity-60"
                >
                  Clear Selection
                </button>
              ) : null}
            </div>
            <p id="imageFile-status" className="mt-2 max-w-lg break-all text-xs text-brown-700">
              {selectedFileName ?? (value?.imageUrl ? "Current uploaded image" : "No image selected")}
            </p>
          </div>
        </div>

        {mode === "edit" && value?.imageUrl && !selectedFileName ? (
          <label className="mt-4 flex items-center gap-3 text-sm font-bold text-red-800">
            <input
              name="removeImage"
              type="checkbox"
              checked={removeImage}
              onChange={(event) => changeRemoveImage(event.target.checked)}
              disabled={isPending}
              className="size-5 accent-red-700"
            />
            Remove the existing image when saving
          </label>
        ) : null}

        {clientImageError ? (
          <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {clientImageError}
          </p>
        ) : null}
        <FieldError field="imageFile" errors={errors} />
      </section>

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
        disabled={isPending || categories.length === 0}
        className="min-h-12 rounded-2xl bg-brown-900 px-6 font-bold text-cream-50 shadow-lg shadow-brown-900/15 transition hover:bg-charcoal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? selectedFileName
            ? "Uploading…"
            : mode === "create"
              ? "Creating…"
              : "Saving…"
          : mode === "create"
            ? "Create Menu Item"
            : "Save Changes"}
      </button>
    </form>
  );
}
