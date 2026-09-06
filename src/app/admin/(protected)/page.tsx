const dashboardSections = [
  {
    title: "Menu management",
    description: "Menu item tools will be added in a later phase.",
  },
  {
    title: "Category management",
    description: "Category tools will be added in a later phase.",
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-caramel-500">Dashboard</p>
      <h1 className="mt-2 text-3xl font-black text-brown-900 sm:text-4xl">Welcome to Croissant Dar</h1>
      <p className="mt-4 max-w-2xl leading-7 text-brown-700">
        Your secure administrator session is active. Management tools will appear here in upcoming phases.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {dashboardSections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-brown-900/10 bg-white p-7 shadow-sm">
            <span className="inline-flex rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-brown-700">
              Coming later
            </span>
            <h2 className="mt-5 text-xl font-black text-brown-900">{section.title}</h2>
            <p className="mt-3 leading-7 text-brown-700">{section.description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
