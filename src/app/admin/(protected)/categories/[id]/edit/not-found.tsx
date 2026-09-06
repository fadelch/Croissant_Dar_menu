import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-3xl place-items-center px-5 py-12 text-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-caramel-500">Not Found</p>
        <h1 className="mt-3 text-3xl font-black text-brown-900">Category not found</h1>
        <p className="mt-4 text-brown-700">
          This category may have been deleted or the link may be invalid.
        </p>
        <Link
          href="/admin/categories"
          className="mt-7 inline-flex rounded-full bg-brown-900 px-5 py-3 text-sm font-bold text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
        >
          Return to Categories
        </Link>
      </div>
    </main>
  );
}
