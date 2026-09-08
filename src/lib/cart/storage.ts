import { CART_STORAGE_VERSION } from "@/lib/cart/constants";
import {
  cartStorageEnvelopeSchema,
  sanitizeCartItems,
} from "@/lib/cart/schema";
import type { CartItem } from "@/lib/cart/types";

export function parseStoredCart(value: string | null): CartItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsedJson: unknown = JSON.parse(value);
    const parsedEnvelope = cartStorageEnvelopeSchema.safeParse(parsedJson);

    if (!parsedEnvelope.success) {
      return [];
    }

    return sanitizeCartItems(parsedEnvelope.data.items);
  } catch {
    return [];
  }
}

export function serializeCart(items: readonly CartItem[]): string {
  return JSON.stringify({
    version: CART_STORAGE_VERSION,
    items: sanitizeCartItems(items),
  });
}

