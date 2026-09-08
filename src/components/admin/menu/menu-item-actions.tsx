"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState, useTransition } from "react";

import {
  deleteMenuItemAction,
  toggleAvailabilityAction,
  toggleFeaturedAction,
  toggleVisibilityAction,
} from "@/app/admin/(protected)/menu/actions";
import type { MenuItemActionState } from "@/components/admin/menu/action-state";

type MenuItemActionsProps = {
  menuItemId: string;
  menuItemName: string;
  isAvailable: boolean;
  isVisible: boolean;
  isFeatured: boolean;
};

type StatusAction = (
  menuItemId: string,
  value: boolean,
) => Promise<MenuItemActionState>;

export function MenuItemActions({
  menuItemId,
  menuItemName,
  isAvailable,
  isVisible,
  isFeatured,
}: MenuItemActionsProps) {
  const router = useRouter();
  const dialogReference = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [statusResult, setStatusResult] = useState<MenuItemActionState | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function changeStatus(action: StatusAction, value: boolean) {
    setStatusResult(null);

    startTransition(async () => {
      const result = await action(menuItemId, value);
      setStatusResult(result);

      if (result.status === "success") {
        router.refresh();
      }
    });
  }

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteMenuItemAction(menuItemId);

      if (result.status === "success") {
        dialogReference.current?.close();
        router.replace("/admin/menu?notice=deleted");
        return;
      }

      setDeleteError(result.message ?? "Unable to delete the menu item.");
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/menu/${menuItemId}/edit`}
          className="rounded-full border border-brown-900/15 bg-white px-3 py-2 text-xs font-bold text-brown-900 transition hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => changeStatus(toggleAvailabilityAction, !isAvailable)}
          disabled={isPending}
          className="rounded-full border border-caramel-500/30 bg-caramel-400/10 px-3 py-2 text-xs font-bold text-brown-900 disabled:opacity-60"
        >
          {isAvailable ? "Mark Unavailable" : "Mark Available"}
        </button>
        <button
          type="button"
          onClick={() => changeStatus(toggleVisibilityAction, !isVisible)}
          disabled={isPending}
          className="rounded-full border border-caramel-500/30 bg-caramel-400/10 px-3 py-2 text-xs font-bold text-brown-900 disabled:opacity-60"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          onClick={() => changeStatus(toggleFeaturedAction, !isFeatured)}
          disabled={isPending}
          className="rounded-full border border-caramel-500/30 bg-caramel-400/10 px-3 py-2 text-xs font-bold text-brown-900 disabled:opacity-60"
        >
          {isFeatured ? "Remove Featured" : "Make Featured"}
        </button>
        <button
          type="button"
          onClick={() => dialogReference.current?.showModal()}
          disabled={isPending}
          className="rounded-full border border-red-700/20 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      {isPending ? <p className="mt-2 text-xs text-brown-700">Updating…</p> : null}
      {statusResult?.message ? (
        <p
          role={statusResult.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className="mt-2 max-w-sm text-xs text-brown-700"
        >
          {statusResult.message}
        </p>
      ) : null}

      <dialog
        ref={dialogReference}
        aria-labelledby={`delete-menu-title-${menuItemId}`}
        className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-brown-900/10 bg-white p-0 text-charcoal-950 shadow-2xl backdrop:bg-charcoal-950/55"
      >
        <form onSubmit={confirmDelete} className="p-6 sm:p-8">
          <h2 id={`delete-menu-title-${menuItemId}`} className="text-xl font-black text-brown-900">
            Delete “{menuItemName}”?
          </h2>
          <p className="mt-3 leading-7 text-brown-700">
            This action cannot be undone. Its owned product image will also be removed.
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
              className="rounded-full border border-brown-900/15 px-4 py-2 text-sm font-bold text-brown-900 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {isPending ? "Deleting…" : "Delete Menu Item"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
