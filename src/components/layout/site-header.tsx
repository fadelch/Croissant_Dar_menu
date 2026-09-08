import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { CartButton } from "@/components/cart/cart-button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MobileNavigation } from "@/components/site/mobile-navigation";
import { BrandMark } from "@/components/ui/brand-mark";
import { Container } from "@/components/ui/container";
import { getAlternateLocale } from "@/i18n/routing";

export function SiteHeader() {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const cart = useTranslations("Cart");
  const checkout = useTranslations("Checkout");
  const targetLocale = getAlternateLocale(locale);
  const targetLanguage = t(`languages.${targetLocale}`);
  const links = [
    { href: "#home", label: t("home") },
    { href: "#menu", label: t("menu") },
    { href: "#about", label: t("about") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brown-900/10 bg-cream-50/95 backdrop-blur">
      <Container className="flex min-h-20 items-center justify-between gap-3 py-3">
        <Link
          href="#home"
          aria-label={t("homeLabel")}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-500"
        >
          <BrandMark />
        </Link>

        <nav aria-label={t("primaryLabel")} className="hidden items-center gap-7 text-sm font-black text-brown-700 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm transition-colors hover:text-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel-500"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher
            targetLocale={targetLocale}
            label={targetLanguage}
            accessibleLabel={t("switchTo", { language: targetLanguage })}
          />
          <CartButton
            locale={locale}
            label={cart("open")}
            quantityLabel={cart.raw("quantityLabel") as string}
            panelLabels={{
              title: cart("title"),
              close: cart("close"),
              loading: cart("loading"),
              empty: cart("empty"),
              emptyDescription: cart("emptyDescription"),
              unitPrice: cart("unitPrice"),
              lineTotal: cart("lineTotal"),
              quantity: cart("quantity"),
              increase: cart("increase"),
              decrease: cart("decrease"),
              remove: cart("remove"),
              clear: cart("clear"),
              total: cart("total"),
              checkout: {
                customerDetails: checkout("customerDetails"),
                detailsDescription: checkout("detailsDescription"),
                firstName: checkout("firstName"),
                lastName: checkout("lastName"),
                phone: checkout("phone"),
                orderType: checkout("orderType"),
                dineIn: checkout("dineIn"),
                pickup: checkout("pickup"),
                delivery: checkout("delivery"),
                note: checkout("note"),
                optional: checkout("optional"),
                reviewOrder: checkout("reviewOrder"),
                reviewHeading: checkout("reviewHeading"),
                reviewDescription: checkout("reviewDescription"),
                customer: checkout("customer"),
                items: checkout("items"),
                unitPrice: checkout("unitPrice"),
                lineTotal: checkout("lineTotal"),
                total: checkout("total"),
                validation: {
                  firstNameRequired: checkout("validation.firstNameRequired"),
                  firstNameTooLong: checkout("validation.firstNameTooLong"),
                  lastNameRequired: checkout("validation.lastNameRequired"),
                  lastNameTooLong: checkout("validation.lastNameTooLong"),
                  phoneRequired: checkout("validation.phoneRequired"),
                  phoneInvalid: checkout("validation.phoneInvalid"),
                  orderTypeRequired: checkout("validation.orderTypeRequired"),
                  noteTooLong: checkout("validation.noteTooLong"),
                },
              },
            }}
          />
          <MobileNavigation
            links={links}
            navigationLabel={t("mobileLabel")}
            openLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
          />
        </div>
      </Container>
    </header>
  );
}
