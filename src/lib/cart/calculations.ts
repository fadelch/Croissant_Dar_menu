import type { CartItem } from "@/lib/cart/types";

export function getCartLineTotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function getCartTotalQuantity(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotalPrice(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + getCartLineTotal(item), 0);
}

