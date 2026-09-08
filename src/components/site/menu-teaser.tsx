import { useTranslations } from "next-intl";

import { PublicMenu } from "@/components/site/public-menu";
import { Container } from "@/components/ui/container";
import type {
  PublicMenuCategory,
  PublicMenuItem,
} from "@/types/public-menu";

type MenuTeaserProps = {
  categories: PublicMenuCategory[];
  items: PublicMenuItem[];
  status: "success" | "error";
};

export function MenuTeaser({ categories, items, status }: MenuTeaserProps) {
  const t = useTranslations("Home.menu");
  const cart = useTranslations("Cart");

  return (
    <section id="menu" aria-labelledby="menu-heading" className="scroll-mt-24 bg-cream-100 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 border-b border-brown-900/15 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-caramel-500">
              {t("eyebrow")}
            </p>
            <h2 id="menu-heading" className="mt-5 text-4xl font-black leading-tight text-brown-900 sm:text-5xl">
              {t("title")}
            </h2>
          </div>
          <p className="max-w-md leading-7 text-brown-700">{t("description")}</p>
        </div>

        {status === "error" ? (
          <div className="mt-10 border border-brown-900/15 bg-white p-7 sm:p-9">
            <h3 className="text-2xl font-black text-brown-900">{t("error.title")}</h3>
            <p className="mt-3 max-w-xl leading-7 text-brown-700">{t("error.description")}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 border border-brown-900/15 bg-white p-7 sm:p-9">
            <h3 className="text-2xl font-black text-brown-900">{t("empty.title")}</h3>
            <p className="mt-3 max-w-xl leading-7 text-brown-700">{t("empty.description")}</p>
          </div>
        ) : (
          <PublicMenu
            categories={categories}
            items={items}
            allLabel={t("all")}
            filterLabel={t("filterLabel")}
            unavailableLabel={t("unavailable")}
            noImageLabel={t("noImage")}
            addToCartLabel={cart("add")}
            addedLabel={cart("added")}
            maximumLabel={cart("maximumReached")}
          />
        )}
      </Container>
    </section>
  );
}
