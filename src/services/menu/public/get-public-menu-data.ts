import "server-only";

import type { Locale } from "@/i18n/routing";
import { getActiveCategories } from "@/services/categories/read";
import { getVisibleMenuItems } from "@/services/menu/read";
import type { Category } from "@/types/category";
import type { MenuItem } from "@/types/menu";
import type {
  PublicMenuCategory,
  PublicMenuData,
  PublicMenuItem,
} from "@/types/public-menu";

function localizedCategoryName(category: Category, locale: Locale): string {
  return locale === "ar" ? (category.nameAr ?? category.nameEn) : category.nameEn;
}

function localizedMenuItemName(item: MenuItem, locale: Locale): string {
  return locale === "ar" ? item.nameAr : (item.nameEn ?? item.nameAr);
}

function localizedMenuItemDescription(
  item: MenuItem,
  locale: Locale,
): string | undefined {
  return locale === "ar"
    ? (item.descriptionAr ?? item.descriptionEn)
    : (item.descriptionEn ?? item.descriptionAr);
}

function toPublicMenuItem(item: MenuItem, locale: Locale): PublicMenuItem {
  const description = localizedMenuItemDescription(item, locale);

  return {
    id: item.id,
    categoryId: item.categoryId,
    name: localizedMenuItemName(item, locale),
    nameAr: item.nameAr,
    ...(item.nameEn ? { nameEn: item.nameEn } : {}),
    ...(description ? { description } : {}),
    price: item.price,
    ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
  };
}

export async function getPublicMenuData(locale: Locale): Promise<PublicMenuData> {
  const [activeCategories, visibleItems] = await Promise.all([
    getActiveCategories(),
    getVisibleMenuItems(),
  ]);
  const activeCategoryMap = new Map(
    activeCategories.map((category) => [category.id, category]),
  );
  const eligibleItems = visibleItems.filter((item) =>
    activeCategoryMap.has(item.categoryId),
  );
  const usedCategoryIds = new Set(
    eligibleItems.map((item) => item.categoryId),
  );
  const categories: PublicMenuCategory[] = activeCategories
    .filter((category) => usedCategoryIds.has(category.id))
    .map((category) => ({
      id: category.id,
      name: localizedCategoryName(category, locale),
    }));
  const items = eligibleItems.map((item) => toPublicMenuItem(item, locale));

  return {
    categories,
    items,
    featuredItems: items.filter((item) => item.isFeatured),
  };
}
