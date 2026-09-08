import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

const detailKeys = ["layers", "fillings", "craving"] as const;

export function BrandIntroduction() {
  const t = useTranslations("Home.introduction");

  return (
    <section id="introduction" aria-labelledby="introduction-heading" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-caramel-500">
              {t("eyebrow")}
            </p>
            <h2 id="introduction-heading" className="mt-5 max-w-xl text-4xl font-black leading-[1.08] text-brown-900 sm:text-5xl">
              {t("title")}
            </h2>
          </div>
          <div>
            <p className="max-w-2xl text-xl leading-9 text-brown-700 sm:text-2xl sm:leading-10">
              {t("description")}
            </p>
            <div className="mt-10 grid gap-7 border-t border-brown-900/15 pt-8 sm:grid-cols-3">
              {detailKeys.map((key, index) => (
                <article key={key}>
                  <span className="text-xs font-black text-caramel-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-black text-brown-900">
                    {t(`details.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brown-700">
                    {t(`details.${key}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
