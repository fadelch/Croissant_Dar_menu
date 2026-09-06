import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { getDirection } from "@/i18n/routing";

import "../globals.css";

type PublicRootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    applicationName: "Croissant Dar",
    alternates: { canonical: "/" },
  };
}

export default async function PublicRootLayout({ children }: PublicRootLayoutProps) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={getDirection(locale)}>
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider locale={locale} messages={null}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
