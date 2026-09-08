import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

function MenuCardPlaceholder({ index }: { index: number }) {
  return (
    <div aria-hidden="true" className="border-t border-brown-900/15 py-6 first:border-t-0 sm:first:border-t">
      <div className="flex items-start gap-5">
        <span className="text-xs font-black text-caramel-500">0{index}</span>
        <div className="flex-1">
          <div className="h-3 w-2/3 rounded-full bg-brown-900/12" />
          <div className="mt-4 h-2 w-full rounded-full bg-brown-900/7" />
          <div className="mt-2 h-2 w-4/5 rounded-full bg-brown-900/7" />
        </div>
        <div className="size-14 shrink-0 border border-brown-900/10 bg-cream-100" />
      </div>
    </div>
  );
}

export function MenuTeaser() {
  const t = useTranslations("Home.menu");

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

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.38fr_0.62fr]">
          <div className="bg-brown-900 p-7 text-cream-50 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-caramel-400">
              {t("categoryArea.eyebrow")}
            </p>
            <h3 className="mt-5 text-2xl font-black">{t("categoryArea.title")}</h3>
            <p className="mt-4 leading-7 text-cream-100/70">
              {t("categoryArea.description")}
            </p>
            <div aria-hidden="true" className="mt-10 space-y-3">
              {["70%", "48%", "61%", "42%"].map((width) => (
                <div key={width} className="h-10 border border-cream-100/15 p-3">
                  <div className="h-2 rounded-full bg-cream-100/15" style={{ width }} />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-brown-900/12 bg-white p-7 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-caramel-500">
              {t("productArea.eyebrow")}
            </p>
            <h3 className="mt-5 text-2xl font-black text-brown-900">
              {t("productArea.title")}
            </h3>
            <p className="mt-4 max-w-xl leading-7 text-brown-700">
              {t("productArea.description")}
            </p>
            <div className="mt-9 grid gap-x-8 sm:grid-cols-2">
              {[1, 2, 3, 4].map((index) => (
                <MenuCardPlaceholder key={index} index={index} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
