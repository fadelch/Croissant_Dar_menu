import Image from "next/image";

import { formatLBP } from "@/lib/formatters/currency";
import type { PublicMenuItem } from "@/types/public-menu";

type ProductCardProps = {
  item: PublicMenuItem;
  unavailableLabel: string;
  noImageLabel: string;
};

function ProductImage({
  item,
  noImageLabel,
}: Pick<ProductCardProps, "item" | "noImageLabel">) {
  if (!item.imageUrl) {
    return (
      <div
        role="img"
        aria-label={noImageLabel}
        className="grid h-full place-items-center bg-brown-900 p-6 text-center text-cream-50"
      >
        <div>
          <span aria-hidden="true" className="font-display text-4xl font-black text-caramel-400">
            CD
          </span>
          <p className="mt-3 text-xs font-bold text-cream-100/65">{noImageLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={item.imageUrl}
      alt={item.name}
      fill
      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
      className="object-cover"
    />
  );
}

export function ProductCard({
  item,
  unavailableLabel,
  noImageLabel,
}: ProductCardProps) {
  const headingId = `menu-item-${item.id}`;

  return (
    <article
      data-menu-item-id={item.id}
      aria-labelledby={headingId}
      className={`group h-full overflow-hidden border bg-white ${
        item.isAvailable ? "border-brown-900/12" : "border-brown-900/25"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        <ProductImage item={item} noImageLabel={noImageLabel} />
        {!item.isAvailable ? (
          <span className="absolute end-3 top-3 rounded-full border border-white/30 bg-charcoal-950 px-3 py-1.5 text-xs font-black text-cream-50 shadow-sm">
            {unavailableLabel}
          </span>
        ) : null}
      </div>

      <div className="flex min-h-48 flex-col p-5 sm:p-6">
        <h3 id={headingId} className="text-xl font-black leading-snug text-brown-900">
          {item.name}
        </h3>
        {item.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-brown-700">
            {item.description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
          <p className="whitespace-nowrap text-lg font-black text-caramel-500" dir="ltr">
            {formatLBP(item.price)}
          </p>
          {!item.isAvailable ? (
            <p className="text-xs font-bold text-brown-700">{unavailableLabel}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
