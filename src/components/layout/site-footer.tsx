import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal-950 py-8 text-cream-100">
      <Container className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold">{siteConfig.name}</p>
        <p className="text-cream-100/65">تجربة المخبوزات الدافئة — قريباً</p>
      </Container>
    </footer>
  );
}
