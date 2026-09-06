"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState, useTransition } from "react";

import {
  deleteCategoryAction,
  toggleCategoryAction,
} from "@/app/admin/(protected)/categories/actions";

type CategoryActionsProps = {
  categoryId: string;
  categoryName: string;
  isActive: boolean;
};

export function CategoryActions({
  categoryId,
  categoryName,
  isActive,
}: CategoryActionsProps) {
  const router = useRouter();
  const dialogReference = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleStatus() {
    setStatusMessage(null);

    startTransition(async () => {
      const result = await toggleCategoryAction(categoryId, !isActive);
      setStatusMessage(result.message ?? "Unable to update the category status.");

      if (result.status === "success") {
        router.refresh();
      }
    });
  }

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);

      if (result.status === "success") {
        dialogReference.current?.close();
        router.replace("/admin/categories?notice=deleted");
        return;
      }

      setDeleteError(result.message ?? "Unable to delete the category.");
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/categories/${categoryId}/edit`}
          className="rounded-full border border-brown-900/15 bg-white px-3 py-2 text-xs font-bold text-brown-900 transition hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={toggleStatus}
          disabled={isPending}
          className="rounded-full border border-caramel-500/30 bg-caramel-400/10 px-3 py-2 text-xs font-bold text-brown-900 transition hover:bg-caramel-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Updating…" : isActive ? "Disable" : "Enable"}
        </button>
        <button
          type="button"
          onClick={() => dialogReference.current?.showModal()}
          disabled={isPending}
          className="rounded-full border border-red-700/20 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      {statusMessage ? (
        <p role="status" aria-live="polite" className="mt-2 max-w-xs text-xs text-brown-700">
          {statusMessage}
        </p>
      ) : null}

      <dialog
        ref={dialogReference}
        aria-labelledby={`delete-title-${categoryId}`}
        className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-brown-900/10 bg-white p-0 text-charcoal-950 shadow-2xl backdrop:bg-charcoal-950/55"
      >
        <form onSubmit={confirmDelete} className="p-6 sm:p-8">
          <h2 id={`delete-title-${categoryId}`} className="text-xl font-black text-brown-900">
            Delete category “{categoryName}”?
          </h2>
          <p className="mt-3 leading-7 text-brown-700">
            This action cannot be undone. Categories containing menu items cannot be deleted.
          </p>

          {deleteError ? (
            <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {deleteError}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogReference.current?.close()}
              disabled={isPending}
              className="rounded-full border border-brown-900/15 px-4 py-2 text-sm font-bold text-brown-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Deleting…" : "Delete Category"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
