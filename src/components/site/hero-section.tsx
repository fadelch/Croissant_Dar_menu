import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

function HeroMediaPlaceholder() {
  const brand = useTranslations("Brand");
  const t = useTranslations("Home.hero");

  return (
    <div
      data-phase-13-media-slot="true"
      className="relative isolate min-h-[25rem] overflow-hidden bg-charcoal-950 sm:min-h-[31rem] lg:min-h-[38rem]"
      aria-label={t("visualAccessibleLabel")}
      role="img"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-90 [background:radial-gradient(circle_at_20%_15%,rgba(201,133,69,0.42),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(173,105,49,0.25),transparent_36%),linear-gradient(145deg,#39271f_0%,#211e1b_62%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-5 border border-cream-100/15 sm:inset-8"
      />
      <div
        aria-hidden="true"
        className="absolute -end-20 top-10 size-72 rounded-full border-[3rem] border-caramel-400/15 sm:size-96"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -start-20 size-64 rotate-12 border-[2.5rem] border-cream-100/8 sm:size-80"
      />

      <div className="relative flex min-h-[25rem] flex-col justify-between p-9 text-cream-50 sm:min-h-[31rem] sm:p-12 lg:min-h-[38rem] lg:p-14">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-caramel-400">
          {t("visualEyebrow")}
        </p>
        <div>
          <p className="font-display text-5xl font-black leading-none sm:text-7xl" dir="ltr">
            CD
          </p>
          <p className="mt-5 max-w-sm text-2xl font-black leading-tight sm:text-3xl">
            {brand("name")}
          </p>
          <p className="mt-3 max-w-sm leading-7 text-cream-100/70">
            {t("visualPlaceholder")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("Home.hero");

  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative scroll-mt-24 overflow-hidden border-b border-brown-900/10"
    >
      <Container className="grid min-h-[calc(100dvh-5rem)] items-stretch px-0 sm:px-0 lg:grid-cols-[0.94fr_1.06fr] lg:px-12 lg:py-8">
        <div className="flex items-center px-5 py-14 sm:px-8 sm:py-20 lg:px-0 lg:pe-14">
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

        <HeroMediaPlaceholder />
      </Container>
    </section>
  );
}
