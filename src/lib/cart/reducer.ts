import { MAX_CART_LINES, MAX_CART_QUANTITY } from "@/lib/cart/constants";
import { cartProductSchema, sanitizeCartItems } from "@/lib/cart/schema";
import type { CartItem, CartProduct, CartState } from "@/lib/cart/types";

export type CartAction =
  | { type: "hydrate"; items: readonly unknown[] }
  | { type: "add"; product: CartProduct }
  | { type: "increment"; productId: string }
  | { type: "decrement"; productId: string }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export const initialCartState: CartState = {
  items: [],
  isHydrated: false,
};

function updateQuantity(
  items: readonly CartItem[],
  productId: string,
  change: 1 | -1,
): CartItem[] {
  return items.map((item) => {
    if (item.id !== productId) {
      return item;
    }

    const nextQuantity = item.quantity + change;

    if (nextQuantity < 1 || nextQuantity > MAX_CART_QUANTITY) {
      return item;
    }

    return { ...item, quantity: nextQuantity };
  });
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return {
        items: sanitizeCartItems(action.items),
        isHydrated: true,
      };

    case "add": {
      const parsedProduct = cartProductSchema.safeParse(action.product);

      if (!parsedProduct.success) {
        return state;
      }

      const product = parsedProduct.data;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === product.id
              ? {
                  ...product,
                  quantity: Math.min(MAX_CART_QUANTITY, item.quantity + 1),
                }
              : item,
          ),
        };
      }

      if (state.items.length >= MAX_CART_LINES) {
        return state;
      }

      return {
        ...state,
        items: [...state.items, { ...product, quantity: 1 }],
      };
    }

    case "increment":
      return {
        ...state,
        items: updateQuantity(state.items, action.productId, 1),
      };

    case "decrement":
      return {
        ...state,
        items: updateQuantity(state.items, action.productId, -1),
      };

    case "remove":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.productId),
      };

    case "clear":
      return { ...state, items: [] };
  }
}

