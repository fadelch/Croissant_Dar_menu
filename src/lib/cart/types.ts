export type CartProduct = {
  id: string;
  nameAr: string;
  nameEn?: string;
  price: number;
  imageUrl?: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  isHydrated: boolean;
};

