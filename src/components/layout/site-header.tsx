import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-brown-900/10 bg-cream-50/90 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" aria-label="الصفحة الرئيسية لكروسان الدار">
          <BrandMark />
        </Link>
        <span className="rounded-full border border-caramel-400/30 px-4 py-2 text-xs font-bold text-brown-700">
          قريباً
        </span>
      </Container>
    </header>
  );
}
