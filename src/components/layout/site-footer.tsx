import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

export function SiteFooter() {
  const brand = useTranslations("Brand");
  const footer = useTranslations("Footer");

  return (
    <footer className="bg-charcoal-950 py-8 text-cream-100">
      <Container className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold">{brand("name")}</p>
        <p className="text-cream-100/65">{footer("comingSoon")}</p>
      </Container>
    </footer>
  );
}
