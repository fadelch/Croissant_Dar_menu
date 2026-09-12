"use client";

import { useCallback, useState } from "react";

import { CartPanel, type CartPanelLabels } from "@/components/cart/cart-panel";
import { useCart } from "@/components/cart/cart-provider";
import type { Locale } from "@/i18n/routing";

type CartButtonProps = {
  locale: Locale;
  label: string;
  quantityLabel: string;
  panelLabels: CartPanelLabels;
};

export function CartButton({
  locale,
  label,
  quantityLabel,
  panelLabels,
}: CartButtonProps) {
  const { isHydrated, totalQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const accessibleLabel =
    isHydrated && totalQuantity > 0
      ? `${label}. ${quantityLabel.replace("{quantity}", String(totalQuantity))}`
      : label;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={accessibleLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="cart-panel"
        className="relative inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-2 rounded-full border border-brown-900/15 bg-white px-3 text-brown-900 transition-colors hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 xl:px-4"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 5h2l2 10h9l2-7H7" />
          <circle cx="10" cy="19" r="1" />
          <circle cx="17" cy="19" r="1" />
        </svg>
        <span className="hidden text-xs font-black xl:inline">{label}</span>
        {isHydrated && totalQuantity > 0 ? (
          <span
            aria-hidden="true"
            data-cart-badge
            className="absolute -end-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-caramel-500 px-1 text-[0.65rem] font-black leading-none text-cream-50"
          >
            {totalQuantity}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <CartPanel locale={locale} labels={panelLabels} onClose={closePanel} />
      ) : null}
    </>
  );
}
