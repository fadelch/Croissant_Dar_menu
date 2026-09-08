import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

const valueKeys = ["familiar", "bold", "balanced"] as const;

export function BrandStory() {
  const t = useTranslations("Home.story");

  return (
    <section id="about" aria-labelledby="story-heading" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-24">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-caramel-500">
              {t("eyebrow")}
            </p>
            <h2 id="story-heading" className="mt-5 max-w-3xl text-4xl font-black leading-[1.08] text-brown-900 sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-brown-700">
              {t("description")}
            </p>
          </div>

          <div className="divide-y divide-brown-900/15 border-y border-brown-900/15">
            {valueKeys.map((key, index) => (
              <article key={key} className="grid grid-cols-[2.5rem_1fr] gap-4 py-6">
                <span className="text-xs font-black text-caramel-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-black text-brown-900">
                    {t(`values.${key}.title`)}
                  </h3>
                  <p className="mt-2 leading-7 text-brown-700">
                    {t(`values.${key}.description`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
