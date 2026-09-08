import { BrandIntroduction } from "@/components/site/brand-introduction";
import { BrandStory } from "@/components/site/brand-story";
import { FeaturedSection } from "@/components/site/featured-section";
import { HeroSection } from "@/components/site/hero-section";
import { MenuTeaser } from "@/components/site/menu-teaser";
import { OrderCta } from "@/components/site/order-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-cream-50">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <BrandIntroduction />
        <MenuTeaser />
        <FeaturedSection />
        <BrandStory />
        <OrderCta />
      </main>
      <SiteFooter />
    </div>
  );
}
