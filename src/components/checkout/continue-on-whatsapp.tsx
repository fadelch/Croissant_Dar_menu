"use client";

import type { Locale } from "@/i18n/routing";
import type { CartItem } from "@/lib/cart/types";
import type { CheckoutDetails } from "@/lib/checkout/types";
import { buildWhatsAppOrderMessage } from "@/lib/whatsapp/build-order-message";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";
import { configuredWhatsAppNumber } from "@/lib/whatsapp/config";

type ContinueOnWhatsAppProps = {
  checkoutDetails: CheckoutDetails;
  cartItems: readonly CartItem[];
  totalPrice: number;
  locale: Locale;
  label: string;
  opensNewWindowLabel: string;
  unavailableLabel: string;
};

export function ContinueOnWhatsApp({
  checkoutDetails,
  cartItems,
  totalPrice,
  locale,
  label,
  opensNewWindowLabel,
  unavailableLabel,
}: ContinueOnWhatsAppProps) {
  if (!configuredWhatsAppNumber || cartItems.length === 0) {
    return (
      <p
        data-whatsapp-order-unavailable
        className="mt-4 border border-brown-900/15 bg-white px-4 py-3 text-sm font-bold text-brown-700"
        role="status"
      >
        {unavailableLabel}
      </p>
    );
  }

  function handleContinue() {
    const message = buildWhatsAppOrderMessage({
      checkoutDetails,
      cartItems,
      totalPrice,
      locale,
    });
    const url = buildWhatsAppUrl(configuredWhatsAppNumber ?? undefined, message);

    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-4">
      <button
        data-whatsapp-order-action
        type="button"
        onClick={handleContinue}
        className="flex min-h-12 w-full items-center justify-center gap-2 bg-brown-900 px-6 py-3 font-black whitespace-nowrap text-cream-50 transition-colors hover:bg-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          className="size-5 shrink-0 fill-current"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.892-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.9 6.993c-.003 5.45-4.437 9.884-9.896 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
        {label}
        <span className="sr-only"> {opensNewWindowLabel}</span>
      </button>
    </div>
  );
}
