export const ORDER_TYPES = ["Dine-in", "Pickup", "Delivery"] as const;

export type OrderType = (typeof ORDER_TYPES)[number];

export type CheckoutDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  orderType: OrderType;
  deliveryLocation?: string;
  note?: string;
};

export type CheckoutField = keyof CheckoutDetails;

