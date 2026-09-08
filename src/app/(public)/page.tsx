import { getLocale } from "next-intl/server";

import { BrandIntroduction } from "@/components/site/brand-introduction";
import { BrandStory } from "@/components/site/brand-story";
import { FeaturedSection } from "@/components/site/featured-section";
import { HeroSection } from "@/components/site/hero-section";
import { MenuTeaser } from "@/components/site/menu-teaser";
import { OrderCta } from "@/components/site/order-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { getPublicMenuData } from "@/services/menu/public/get-public-menu-data";
import type { PublicMenuData } from "@/types/public-menu";

const emptyMenuData: PublicMenuData = {
  categories: [],
  items: [],
  featuredItems: [],
};

export default async function HomePage() {
  const requestedLocale = await getLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  let menuData = emptyMenuData;
  let menuStatus: "success" | "error" = "success";

  try {
    menuData = await getPublicMenuData(locale);
  } catch {
    console.error("Unable to load the public menu.");
    menuStatus = "error";
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-cream-50">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <BrandIntroduction />
        <MenuTeaser
          categories={menuData.categories}
          items={menuData.items}
          status={menuStatus}
        />
        <FeaturedSection
          items={menuData.featuredItems}
          status={menuStatus}
        />
        <BrandStory />
        <OrderCta />
      </main>
      <SiteFooter />
    </div>
  );
}
