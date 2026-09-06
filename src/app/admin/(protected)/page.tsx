import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-caramel-500">Dashboard</p>
      <h1 className="mt-2 text-3xl font-black text-brown-900 sm:text-4xl">Welcome to Croissant Dar</h1>
      <p className="mt-4 max-w-2xl leading-7 text-brown-700">
        Your secure administrator session is active. Management tools will appear here in upcoming phases.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <section className="rounded-3xl border border-caramel-500/25 bg-white p-7 shadow-sm">
          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
            Available
          </span>
          <h2 className="mt-5 text-xl font-black text-brown-900">Category management</h2>
          <p className="mt-3 leading-7 text-brown-700">
            Create, edit, order, enable, disable, and safely delete categories.
          </p>
          <Link
            href="/admin/categories"
            className="mt-6 inline-flex rounded-full bg-brown-900 px-5 py-2.5 text-sm font-bold text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
          >
            Manage Categories
          </Link>
        </section>

        <section className="rounded-3xl border border-brown-900/10 bg-white p-7 shadow-sm">
          <span className="inline-flex rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-brown-700">
            Coming later
          </span>
          <h2 className="mt-5 text-xl font-black text-brown-900">Menu management</h2>
          <p className="mt-3 leading-7 text-brown-700">
            Menu item tools will be added in Phase 7.
          </p>
        </section>
      </div>
    </main>
  );
}
