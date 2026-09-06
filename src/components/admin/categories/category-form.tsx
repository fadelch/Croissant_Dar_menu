"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/(protected)/categories/actions";
import {
  initialCategoryActionState,
  type CategoryFormField,
} from "@/components/admin/categories/action-state";

type CategoryFormValues = {
  id: string;
  nameAr: string;
  nameEn?: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
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

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const formReference = useRef<HTMLFormElement>(null);
  const lastHandledRevision = useRef(0);
  const action =
    mode === "create"
      ? createCategoryAction
      : updateCategoryAction.bind(null, category.id);
  const [state, formAction, isPending] = useActionState(action, initialCategoryActionState);

  useEffect(() => {
    if (
      mode === "create" &&
      state.status === "success" &&
      state.revision !== lastHandledRevision.current
    ) {
      formReference.current?.reset();
    }

    lastHandledRevision.current = state.revision;
  }, [mode, state.revision, state.status]);

  const errors = state.fieldErrors;
  const value = category;

  return (
    <form ref={formReference} action={formAction} className="space-y-6" noValidate>
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
            disabled={isPending}
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
            disabled={isPending}
            aria-invalid={Boolean(errors?.sortOrder)}
            aria-describedby={errors?.sortOrder ? "sortOrder-error" : undefined}
            className={inputClassName}
          />
          <FieldError field="sortOrder" errors={errors} />
        </div>
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

      <div>
        <label htmlFor="imageUrl" className="mb-2 block text-sm font-bold text-brown-900">
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          dir="ltr"
          placeholder="https://example.com/category.jpg"
          defaultValue={value?.imageUrl}
          disabled={isPending}
          aria-invalid={Boolean(errors?.imageUrl)}
          aria-describedby={errors?.imageUrl ? "imageUrl-error" : undefined}
          className={inputClassName}
        />
        <FieldError field="imageUrl" errors={errors} />
      </div>

      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-brown-900/10 bg-cream-50 px-4 font-bold text-brown-900">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={value?.isActive ?? true}
          disabled={isPending}
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
        disabled={isPending}
        className="min-h-12 rounded-2xl bg-brown-900 px-6 font-bold text-cream-50 shadow-lg shadow-brown-900/15 transition hover:bg-charcoal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (mode === "create" ? "Creating…" : "Saving…") : mode === "create" ? "Create Category" : "Save Changes"}
      </button>
    </form>
  );
}
