"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CartItemRow } from "@/components/cart/cart-item";
import { useCart } from "@/components/cart/cart-provider";
import {
  CheckoutForm,
  type CheckoutLabels,
} from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import type { CheckoutDetails } from "@/lib/checkout/types";
import { formatLBP } from "@/lib/formatters/currency";
import type { Locale } from "@/i18n/routing";

export type CartPanelLabels = {
  title: string;
  close: string;
  loading: string;
  empty: string;
  emptyDescription: string;
  unitPrice: string;
  lineTotal: string;
  quantity: string;
  increase: string;
  decrease: string;
  remove: string;
  clear: string;
  total: string;
  checkout: CheckoutLabels;
};

type CartPanelProps = {
  locale: Locale;
  labels: CartPanelLabels;
  onClose: () => void;
};

export function CartPanel({ locale, labels, onClose }: CartPanelProps) {
  const {
    items,
    isHydrated,
    totalPrice,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [validatedDetails, setValidatedDetails] = useState<CheckoutDetails | null>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleDialogKeys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleDialogKeys);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDialogKeys);

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-charcoal-950/55"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        id="cart-panel"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-panel-heading"
        className="ms-auto flex h-dvh w-full max-w-md flex-col bg-cream-50 text-brown-900 shadow-2xl shadow-charcoal-950/25"
      >
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-brown-900/12 px-5 py-4 sm:px-7">
          <h2 id="cart-panel-heading" className="text-2xl font-black">
            {labels.title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-brown-900/20 bg-white text-2xl text-brown-900 transition-colors hover:border-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {!isHydrated ? (
            <p className="py-10 text-center text-brown-700" role="status">
              {labels.loading}
            </p>
          ) : items.length === 0 ? (
            <div className="grid min-h-64 place-items-center border border-brown-900/12 bg-white p-7 text-center">
              <div>
                <p aria-hidden="true" className="font-display text-4xl font-black text-caramel-500">
                  CD
                </p>
                <h3 className="mt-4 text-xl font-black">{labels.empty}</h3>
                <p className="mt-3 leading-7 text-brown-700">{labels.emptyDescription}</p>
              </div>
            </div>
          ) : (
            <>
              <ul>
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    locale={locale}
                    unitPriceLabel={labels.unitPrice}
                    lineTotalLabel={labels.lineTotal}
                    quantityLabel={labels.quantity}
                    increaseLabel={labels.increase}
                    decreaseLabel={labels.decrease}
                    removeLabel={labels.remove}
                    onIncrement={() => incrementItem(item.id)}
                    onDecrement={() => decrementItem(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </ul>

              <section className="border-t border-brown-900/12 pt-5" aria-label={labels.total}>
                <div className="flex items-end justify-between gap-4">
                  <p className="font-black">{labels.total}</p>
                  <p className="whitespace-nowrap text-xl font-black text-caramel-500" dir="ltr">
                    {formatLBP(totalPrice)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-4 min-h-11 min-w-11 text-sm font-bold text-brown-700 underline decoration-brown-900/30 underline-offset-4 transition-colors hover:text-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
                >
                  {labels.clear}
                </button>
              </section>

              <CheckoutForm
                labels={labels.checkout}
                onValidatedChange={setValidatedDetails}
              />

              {validatedDetails ? (
                <OrderSummary
                  details={validatedDetails}
                  items={items}
                  totalPrice={totalPrice}
                  locale={locale}
                  labels={labels.checkout}
                />
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
