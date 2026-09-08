"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import {
  getCartTotalPrice,
  getCartTotalQuantity,
} from "@/lib/cart/calculations";
import { CART_STORAGE_KEY } from "@/lib/cart/constants";
import { cartReducer, initialCartState } from "@/lib/cart/reducer";
import { parseStoredCart, serializeCart } from "@/lib/cart/storage";
import type { CartItem, CartProduct } from "@/lib/cart/types";

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  totalQuantity: number;
  totalPrice: number;
  addItem: (product: CartProduct) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    let storedItems: CartItem[] = [];

    try {
      storedItems = parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
    } catch {
      storedItems = [];
    }

    dispatch({ type: "hydrate", items: storedItems });
  }, []);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(state.items));
    } catch {
      // The in-memory cart remains usable when browser storage is unavailable.
    }
  }, [state.isHydrated, state.items]);

  const addItem = useCallback((product: CartProduct) => {
    dispatch({ type: "add", product });
  }, []);
  const incrementItem = useCallback((productId: string) => {
    dispatch({ type: "increment", productId });
  }, []);
  const decrementItem = useCallback((productId: string) => {
    dispatch({ type: "decrement", productId });
  }, []);
  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);
  const clearCart = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      totalQuantity: getCartTotalQuantity(state.items),
      totalPrice: getCartTotalPrice(state.items),
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      clearCart,
      decrementItem,
      incrementItem,
      removeItem,
      state.isHydrated,
      state.items,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

