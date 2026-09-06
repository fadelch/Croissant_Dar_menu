import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { BrandMark } from "@/components/ui/brand-mark";
import { Container } from "@/components/ui/container";
import { getAlternateLocale } from "@/i18n/routing";

export function SiteHeader() {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const targetLocale = getAlternateLocale(locale);
  const targetLanguage = t(`languages.${targetLocale}`);

  return (
    <header className="relative z-20 border-b border-brown-900/10 bg-cream-50/90 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" aria-label={t("homeLabel")}>
          <BrandMark />
        </Link>

        <nav aria-label={t("primaryLabel")} className="hidden items-center gap-6 text-sm font-bold text-brown-700 md:flex">
          <Link href="/" className="transition-colors hover:text-caramel-500">
            {t("home")}
          </Link>
          <a href="#about" className="transition-colors hover:text-caramel-500">
            {t("about")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-caramel-400/30 px-4 py-2 text-xs font-bold text-brown-700 sm:inline-flex">
            {t("openingSoon")}
          </span>
          <LanguageSwitcher
            targetLocale={targetLocale}
            label={targetLanguage}
            accessibleLabel={t("switchTo", { language: targetLanguage })}
          />
        </div>
      </Container>
    </header>
  );
}
