export const locales = ["en", "ar"] as const;
export const defaultLocale = "en" as const;
export const localeCookieName = "croissant_dar_locale";
export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export type Locale = (typeof locales)[number];
export type Direction = "rtl" | "ltr";

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function getDirection(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
