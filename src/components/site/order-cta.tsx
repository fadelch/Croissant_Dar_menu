import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

export function OrderCta() {
  const t = useTranslations("Home.cta");

  return (
    <section id="contact" aria-labelledby="cta-heading" className="scroll-mt-24 bg-caramel-400 py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brown-900/70">
              {t("eyebrow")}
            </p>
            <h2 id="cta-heading" className="mt-4 text-4xl font-black leading-tight text-charcoal-950 sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-brown-900/80">
              {t("description")}
            </p>
          </div>
          <a
            href="#menu"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-charcoal-950 px-7 text-sm font-black text-cream-50 shadow-lg shadow-brown-900/20 transition-colors hover:bg-brown-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-50"
          >
            {t("button")}
          </a>
        </div>
      </Container>
    </section>
  );
}
