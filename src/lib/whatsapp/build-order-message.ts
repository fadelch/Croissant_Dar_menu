import type { Locale } from "@/i18n/routing";
import type { CartItem } from "@/lib/cart/types";
import type { CheckoutDetails } from "@/lib/checkout/types";
import { formatLBP } from "@/lib/formatters/currency";

type BuildWhatsAppOrderMessageInput = {
  checkoutDetails: CheckoutDetails;
  cartItems: readonly CartItem[];
  totalPrice: number;
  locale: Locale;
};

function getLocalizedProductName(item: CartItem, locale: Locale): string {
  return locale === "ar" ? item.nameAr : (item.nameEn ?? item.nameAr);
}

export function buildWhatsAppOrderMessage({
  checkoutDetails,
  cartItems,
  totalPrice,
  locale,
}: BuildWhatsAppOrderMessageInput): string {
  const orderLines = cartItems.map(
    (item) =>
      `${item.quantity} × ${getLocalizedProductName(item, locale)} ${formatLBP(item.price)}`,
  );
  const note = checkoutDetails.note?.trim();
  const sections = [
    "Hello Croissant Dar,",
    `Customer details:\nName: ${checkoutDetails.firstName} ${checkoutDetails.lastName}\nPhone: ${checkoutDetails.phone}`,
    `Order details:\nOrder type: ${checkoutDetails.orderType}${
      checkoutDetails.orderType === "Delivery" && checkoutDetails.deliveryLocation
        ? `\nDelivery location: ${checkoutDetails.deliveryLocation}`
        : ""
    }`,
    `I would like to order:\n${orderLines.join("\n")}`,
    ...(note ? [`Order note:\n${note}`] : []),
    `----------------------------\nTotal: ${formatLBP(totalPrice)}`,
    "Please confirm availability, delivery, and final total.",
  ];

  return sections.join("\n\n");
}

