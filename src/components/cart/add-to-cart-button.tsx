"use client";

import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { MAX_CART_QUANTITY } from "@/lib/cart/constants";
import type { CartProduct } from "@/lib/cart/types";

type AddToCartButtonProps = {
  product: CartProduct;
  isAvailable: boolean;
  addLabel: string;
  addedLabel: string;
  unavailableLabel: string;
  maximumLabel: string;
};

export function AddToCartButton({
  product,
  isAvailable,
  addLabel,
  addedLabel,
  unavailableLabel,
  maximumLabel,
}: AddToCartButtonProps) {
  const { addItem, isHydrated, items } = useCart();
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const quantity = items.find((item) => item.id === product.id)?.quantity ?? 0;
  const reachedMaximum = quantity >= MAX_CART_QUANTITY;
  const isDisabled = !isAvailable || !isHydrated || reachedMaximum;
  const label = !isAvailable
    ? unavailableLabel
    : reachedMaximum
      ? maximumLabel
      : showAddedFeedback
        ? addedLabel
        : addLabel;

  useEffect(
    () => () => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    },
    [],
  );

  function handleAdd() {
    if (isDisabled) {
      return;
    }

    addItem(product);
    setShowAddedFeedback(true);

    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }

    feedbackTimer.current = setTimeout(() => {
      setShowAddedFeedback(false);
    }, 1_200);
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleAdd}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-brown-900 px-5 text-sm font-black text-cream-50 transition-colors hover:bg-charcoal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:bg-brown-900/15 disabled:text-brown-700/65"
    >
      <span aria-live="polite">{label}</span>
    </button>
  );
}

