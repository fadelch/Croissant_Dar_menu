import { getCartLineTotal } from "@/lib/cart/calculations";
import type { CartItem } from "@/lib/cart/types";
import type { CheckoutDetails, OrderType } from "@/lib/checkout/types";
import { formatLBP } from "@/lib/formatters/currency";
import type { Locale } from "@/i18n/routing";

import type { CheckoutLabels } from "@/components/checkout/checkout-form";

type OrderSummaryProps = {
  details: CheckoutDetails;
  items: readonly CartItem[];
  totalPrice: number;
  locale: Locale;
  labels: CheckoutLabels;
};

function getItemName(item: CartItem, locale: Locale): string {
  return locale === "ar" ? item.nameAr : (item.nameEn ?? item.nameAr);
}

export function OrderSummary({
  details,
  items,
  totalPrice,
  locale,
  labels,
}: OrderSummaryProps) {
  const orderTypeLabels: Record<OrderType, string> = {
    "Dine-in": labels.dineIn,
    Pickup: labels.pickup,
    Delivery: labels.delivery,
  };

  return (
    <section
      className="mt-8 border border-caramel-400/45 bg-cream-100 p-5"
      aria-labelledby="order-review-heading"
      aria-live="polite"
    >
      <h3 id="order-review-heading" className="text-xl font-black">
        {labels.reviewHeading}
      </h3>
      <p className="mt-2 leading-7 text-brown-700">{labels.reviewDescription}</p>

      <dl className="mt-5 grid gap-4 border-t border-brown-900/12 pt-5 text-sm">
        <div>
          <dt className="font-bold text-brown-700">{labels.customer}</dt>
          <dd className="mt-1 font-black text-brown-900">
            {details.firstName} {details.lastName}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-brown-700">{labels.phone}</dt>
          <dd className="mt-1 font-black text-brown-900" dir="ltr">
            {details.phone}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-brown-700">{labels.orderType}</dt>
          <dd className="mt-1 font-black text-brown-900">
            {orderTypeLabels[details.orderType]}
          </dd>
        </div>
        {details.note ? (
          <div>
            <dt className="font-bold text-brown-700">{labels.note}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-brown-900">{details.note}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 border-t border-brown-900/12 pt-5">
        <h4 className="font-black">{labels.items}</h4>
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-bold text-brown-900">
                  <span dir="ltr">{item.quantity} ×</span> {getItemName(item, locale)}
                </p>
                <p className="mt-1 text-xs text-brown-700">
                  {labels.unitPrice}{" "}
                  <span dir="ltr">{formatLBP(item.price)}</span>
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs text-brown-700">{labels.lineTotal}</p>
                <p className="mt-1 whitespace-nowrap font-black text-caramel-500" dir="ltr">
                  {formatLBP(getCartLineTotal(item))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-brown-900/12 pt-5">
        <p className="font-black">{labels.total}</p>
        <p className="whitespace-nowrap text-xl font-black text-caramel-500" dir="ltr">
          {formatLBP(totalPrice)}
        </p>
      </div>
    </section>
  );
}

