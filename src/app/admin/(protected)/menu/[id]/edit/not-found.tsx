import Link from "next/link";

export default function MenuItemNotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-3xl place-items-center px-5 py-12 text-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-caramel-500">Not Found</p>
        <h1 className="mt-3 text-3xl font-black text-brown-900">Menu item not found</h1>
        <p className="mt-4 text-brown-700">
          This item may have been deleted or the link may be invalid.
        </p>
        <Link href="/admin/menu" className="mt-7 inline-flex rounded-full bg-brown-900 px-5 py-3 text-sm font-bold text-cream-50">
          Return to Menu
        </Link>
      </div>
    </main>
  );
}
