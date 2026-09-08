import { z } from "zod";

import {
  CART_STORAGE_VERSION,
  MAX_CART_LINES,
  MAX_CART_QUANTITY,
  MAX_CART_UNIT_PRICE,
} from "@/lib/cart/constants";
import type { CartItem, CartProduct } from "@/lib/cart/types";

const cartProductShape = {
  id: z.string().trim().min(1).max(1_500).regex(/^[^/]+$/),
  nameAr: z.string().trim().min(1).max(120),
  nameEn: z.string().trim().min(1).max(120).optional(),
  price: z.number().finite().int().min(0).max(MAX_CART_UNIT_PRICE),
  imageUrl: z.string().trim().max(2_048).url().optional(),
};

export const cartProductSchema = z.strictObject(cartProductShape) satisfies z.ZodType<CartProduct>;

export const cartItemSchema = z.strictObject({
  ...cartProductShape,
  quantity: z.number().finite().int().min(1).max(MAX_CART_QUANTITY),
}) satisfies z.ZodType<CartItem>;

export const cartStorageEnvelopeSchema = z.strictObject({
  version: z.literal(CART_STORAGE_VERSION),
  items: z.array(z.unknown()).max(MAX_CART_LINES * 10),
});

export function sanitizeCartItems(values: readonly unknown[]): CartItem[] {
  const itemsById = new Map<string, CartItem>();

  for (const value of values) {
    const parsedItem = cartItemSchema.safeParse(value);

    if (!parsedItem.success) {
      continue;
    }

    const item = parsedItem.data;
    const existingItem = itemsById.get(item.id);

    if (existingItem) {
      itemsById.set(item.id, {
        ...item,
        quantity: Math.min(
          MAX_CART_QUANTITY,
          existingItem.quantity + item.quantity,
        ),
      });
      continue;
    }

    if (itemsById.size < MAX_CART_LINES) {
      itemsById.set(item.id, item);
    }
  }

  return Array.from(itemsById.values());
}

