import Image from "next/image";

export function AnimatedBrandLogo() {
  return (
    <span
      className="brand-logo relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream-50 shadow-[0_4px_16px_rgba(57,35,25,0.10)] ring-1 ring-brown-900/10 sm:size-14"
      aria-hidden="true"
      dir="ltr"
    >
      <Image
        src="/croissant-dar-logo.png"
        alt=""
        width={64}
        height={64}
        priority
        sizes="(min-width: 640px) 56px, 48px"
        className="size-full scale-[1.18] object-contain"
      />
      <span
        aria-hidden="true"
        className="brand-logo-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />
    </span>
  );
}
