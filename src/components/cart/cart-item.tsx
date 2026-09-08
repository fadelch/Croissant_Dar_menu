import Image from "next/image";

import { MAX_CART_QUANTITY } from "@/lib/cart/constants";
import { getCartLineTotal } from "@/lib/cart/calculations";
import { formatLBP } from "@/lib/formatters/currency";
import type { Locale } from "@/i18n/routing";
import type { CartItem } from "@/lib/cart/types";

type CartItemRowProps = {
  item: CartItem;
  locale: Locale;
  unitPriceLabel: string;
  lineTotalLabel: string;
  quantityLabel: string;
  increaseLabel: string;
  decreaseLabel: string;
  removeLabel: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

function getItemName(item: CartItem, locale: Locale): string {
  return locale === "ar" ? item.nameAr : (item.nameEn ?? item.nameAr);
}

export function CartItemRow({
  item,
  locale,
  unitPriceLabel,
  lineTotalLabel,
  quantityLabel,
  increaseLabel,
  decreaseLabel,
  removeLabel,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  const name = getItemName(item, locale);

  return (
    <li className="border-b border-brown-900/12 py-6 first:pt-0 last:border-b-0">
      <div className="flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden bg-brown-900">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-full place-items-center font-display text-xl font-black text-caramel-400"
            >
              CD
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-black leading-snug text-brown-900">{name}</h3>
          <p className="mt-2 text-xs text-brown-700">
            {unitPriceLabel}{" "}
            <span className="whitespace-nowrap font-bold" dir="ltr">
              {formatLBP(item.price)}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2" dir="ltr">
          <button
            type="button"
            disabled={item.quantity === 1}
            onClick={onDecrement}
            aria-label={`${decreaseLabel}: ${name}`}
            className="grid size-11 place-items-center rounded-full border border-brown-900/20 bg-white text-xl font-black text-brown-900 transition-colors hover:border-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span aria-hidden="true">−</span>
          </button>
          <span
            aria-label={`${quantityLabel}: ${item.quantity}`}
            aria-live="polite"
            className="min-w-9 text-center font-black text-brown-900"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            disabled={item.quantity >= MAX_CART_QUANTITY}
            onClick={onIncrement}
            aria-label={`${increaseLabel}: ${name}`}
            className="grid size-11 place-items-center rounded-full border border-brown-900/20 bg-white text-xl font-black text-brown-900 transition-colors hover:border-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <div className="text-end">
          <p className="text-xs text-brown-700">{lineTotalLabel}</p>
          <p className="mt-1 whitespace-nowrap font-black text-caramel-500" dir="ltr">
            {formatLBP(getCartLineTotal(item))}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${name}`}
        className="mt-4 min-h-11 text-sm font-bold text-brown-700 underline decoration-brown-900/30 underline-offset-4 transition-colors hover:text-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
      >
        {removeLabel}
      </button>
    </li>
  );
}

