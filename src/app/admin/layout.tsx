import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Croissant Dar Admin",
    template: "%s | Croissant Dar Admin",
  },
  robots: { index: false, follow: false },
};

type AdminRootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-dvh bg-cream-50 text-charcoal-950 antialiased">{children}</body>
    </html>
  );
}
