import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "كروسان الدار | Croissant Dar",
    template: "%s | كروسان الدار",
  },
  description: "كروسان طازج ومخبوزات دافئة بروح الدار.",
  applicationName: "Croissant Dar",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
