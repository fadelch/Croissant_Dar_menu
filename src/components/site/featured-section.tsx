import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

export function FeaturedSection() {
  const t = useTranslations("Home.featured");

  return (
    <section aria-labelledby="featured-heading" className="overflow-hidden bg-charcoal-950 py-20 text-cream-50 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-[22rem] overflow-hidden border border-cream-100/15 bg-brown-900 sm:min-h-[30rem]">
            <div
              aria-hidden="true"
              className="absolute inset-0 [background:linear-gradient(135deg,transparent_0_18%,rgba(201,133,69,0.18)_18%_35%,transparent_35%_58%,rgba(255,250,240,0.06)_58%_72%,transparent_72%)]"
            />
            <div aria-hidden="true" className="absolute inset-8 border border-caramel-400/25" />
            <div className="relative flex min-h-[22rem] items-end p-8 sm:min-h-[30rem] sm:p-12">
              <p className="max-w-sm font-display text-4xl font-black leading-tight text-cream-50/90 sm:text-5xl">
                {t("visualText")}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-caramel-400">
              {t("eyebrow")}
            </p>
            <h2 id="featured-heading" className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cream-100/70">
              {t("description")}
            </p>
            <p className="mt-10 border-s-2 border-caramel-400 ps-5 text-sm font-bold leading-7 text-cream-100/80">
              {t("phaseNote")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
