import { useLocale, useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Container } from "@/components/ui/container";
import { getAlternateLocale } from "@/i18n/routing";

export function SiteFooter() {
  const locale = useLocale();
  const brand = useTranslations("Brand");
  const footer = useTranslations("Footer");
  const navigation = useTranslations("Navigation");
  const targetLocale = getAlternateLocale(locale);
  const targetLanguage = navigation(`languages.${targetLocale}`);
  const links = [
    { href: "#home", label: navigation("home") },
    { href: "#menu", label: navigation("menu") },
    { href: "#about", label: navigation("about") },
    { href: "#contact", label: navigation("contact") },
  ];

  return (
    <footer className="bg-charcoal-950 py-14 text-cream-100">
      <Container>
        <div className="grid gap-10 border-b border-cream-100/15 pb-10 md:grid-cols-[1fr_auto_auto] md:items-start md:gap-14">
          <div className="max-w-sm">
            <p className="text-2xl font-black">{brand("name")}</p>
            <p className="mt-2 text-xs font-bold tracking-[0.14em] text-caramel-400" dir={locale === "ar" ? "ltr" : "rtl"}>
              {brand("secondaryName")}
            </p>
            <p className="mt-5 leading-7 text-cream-100/65">{footer("tagline")}</p>
          </div>

          <nav aria-label={footer("navigationLabel")}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-caramel-400">
              {footer("explore")}
            </p>
            <ul className="mt-4 grid gap-3 text-sm font-bold">
              {links.map((link) => (
                <li key={link.href}>
                  <a className="rounded-sm text-cream-100/75 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-400" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-caramel-400">
              {footer("language")}
            </p>
            <LanguageSwitcher
              targetLocale={targetLocale}
              label={targetLanguage}
              accessibleLabel={navigation("switchTo", { language: targetLanguage })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-xs text-cream-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>{footer("copyright", { year: new Date().getFullYear() })}</p>
          <p>{footer("developerCopyright", { year: new Date().getFullYear() })}</p>
        </div>
      </Container>
    </footer>
  );
}
