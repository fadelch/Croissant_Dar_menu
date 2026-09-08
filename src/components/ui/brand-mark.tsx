import { useLocale, useTranslations } from "next-intl";

export function BrandMark() {
  const locale = useLocale();
  const t = useTranslations("Brand");

  return (
    <span className="inline-flex items-center gap-2.5 sm:gap-3">
      <span
        className="grid size-10 place-items-center rounded-full bg-brown-900 text-[0.65rem] font-black tracking-[0.12em] text-cream-50 shadow-sm sm:size-11"
        aria-hidden="true"
        dir="ltr"
      >
        CD
      </span>
      <span className="leading-tight">
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
