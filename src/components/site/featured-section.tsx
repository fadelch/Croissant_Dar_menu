import { useTranslations } from "next-intl";

import { ProductCard } from "@/components/site/product-card";
import { Container } from "@/components/ui/container";
import type { PublicMenuItem } from "@/types/public-menu";

type FeaturedSectionProps = {
  items: PublicMenuItem[];
  status: "success" | "error";
};

export function FeaturedSection({ items, status }: FeaturedSectionProps) {
  const t = useTranslations("Home.featured");

  return (
    <section aria-labelledby="featured-heading" className="overflow-hidden bg-charcoal-950 py-20 text-cream-50 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 border-b border-cream-100/15 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-caramel-400">
              {t("eyebrow")}
            </p>
            <h2 id="featured-heading" className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              {t("title")}
            </h2>
          </div>
          <p className="max-w-md leading-7 text-cream-100/70">{t("description")}</p>
        </div>

        {status === "success" && items.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <ProductCard
                  item={item}
                  unavailableLabel={t("unavailable")}
                  noImageLabel={t("noImage")}
                />
              </li>
            ))}
          </ul>
        ) : status === "error" ? (
          <div className="mt-10 border border-cream-100/15 bg-brown-900/45 p-7 sm:p-9">
            <h3 className="text-2xl font-black">{t("error.title")}</h3>
            <p className="mt-3 max-w-xl leading-7 text-cream-100/65">
              {t("error.description")}
            </p>
          </div>
        ) : (
          <div className="mt-10 border border-cream-100/15 bg-brown-900/45 p-7 sm:p-9">
            <h3 className="text-2xl font-black">{t("empty.title")}</h3>
            <p className="mt-3 max-w-xl leading-7 text-cream-100/65">
              {t("empty.description")}
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
