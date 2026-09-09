import { useTranslations } from "next-intl";

import { ScrollHeroVideo } from "@/components/site/scroll-hero-video";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  const brand = useTranslations("Brand");
  const t = useTranslations("Home.hero");

  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative scroll-mt-24 border-b border-brown-900/10"
    >
      <Container className="grid items-start px-0 sm:px-0 lg:grid-cols-[0.94fr_1.06fr] lg:px-12">
        <div className="flex items-center px-5 py-14 sm:px-8 sm:py-20 lg:sticky lg:top-20 lg:h-[calc(100svh-5rem)] lg:px-0 lg:pe-14 lg:py-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-caramel-500">
              <span aria-hidden="true" className="h-px w-10 bg-caramel-500" />
              {t("eyebrow")}
            </p>
            <h1
              id="home-heading"
              className="mt-7 text-[clamp(3.2rem,12vw,5.2rem)] font-black leading-[0.94] tracking-[-0.055em] text-brown-900 lg:text-[clamp(4.6rem,6.4vw,7.5rem)]"
            >
              {t("titleLead")}
              <span className="mt-2 block font-display font-medium italic text-caramel-500">
                {t("titleAccent")}
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-brown-700 sm:text-xl sm:leading-9">
              {t("description")}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brown-900 px-6 text-sm font-black text-cream-50 shadow-lg shadow-brown-900/15 transition-colors hover:bg-charcoal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
              >
                {t("menuCta")}
              </a>
              <a
                href="#about"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-brown-900/20 bg-white px-6 text-sm font-black text-brown-900 transition-colors hover:border-caramel-500 hover:text-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
              >
                {t("storyCta")}
              </a>
            </div>

            <a
              href="#introduction"
              className="mt-11 inline-flex min-h-11 items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-brown-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-500"
            >
              {t("scroll")}
              <span aria-hidden="true" className="text-lg">↓</span>
            </a>
          </div>
        </div>

        <ScrollHeroVideo
          source="/media/croissant-dar-hero-scroll.mp4"
          fallbackEyebrow={t("visualEyebrow")}
          fallbackTitle={brand("name")}
          fallbackDescription={t("visualPlaceholder")}
        />
      </Container>
    </section>
  );
}
