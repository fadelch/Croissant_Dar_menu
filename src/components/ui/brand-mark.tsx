import { useLocale, useTranslations } from "next-intl";

import { AnimatedBrandLogo } from "@/components/ui/animated-brand-logo";

export function BrandMark() {
  const locale = useLocale();
  const t = useTranslations("Brand");

  return (
    <span className="inline-flex items-center gap-2.5 sm:gap-3">
      <AnimatedBrandLogo />
      <span className="hidden leading-tight min-[390px]:block">
        <span className="block max-w-28 truncate text-sm font-black text-brown-900 sm:max-w-none sm:text-base">
          {t("name")}
        </span>
        <span
          className="hidden text-[0.6rem] font-bold tracking-[0.14em] text-caramel-500 min-[360px]:block"
          dir={locale === "ar" ? "ltr" : "rtl"}
        >
          {t("secondaryName")}
        </span>
      </span>
    </span>
  );
}
