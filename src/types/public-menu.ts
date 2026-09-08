export type PublicMenuCategory = {
  id: string;
  name: string;
};

export type PublicMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  nameEn?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
};

export type PublicMenuData = {
  categories: PublicMenuCategory[];
  items: PublicMenuItem[];
  featuredItems: PublicMenuItem[];
};
