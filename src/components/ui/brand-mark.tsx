import { siteConfig } from "@/lib/site-config";

export function BrandMark() {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-full bg-caramel-400 text-xl shadow-sm" aria-hidden="true">
        🥐
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-black text-brown-900">{siteConfig.name}</span>
        <span className="block text-[0.65rem] font-bold tracking-[0.18em] text-caramel-500" dir="ltr">
          {siteConfig.nameEn.toUpperCase()}
        </span>
      </span>
    </span>
  );
}
