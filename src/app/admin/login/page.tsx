import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { getAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage() {
  const admin = await getAdminSession();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-12">
      <div aria-hidden="true" className="absolute -start-24 top-8 size-80 rounded-full bg-caramel-400/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -end-24 bottom-0 size-96 rounded-full bg-cream-100 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[2rem] border border-brown-900/10 bg-white/80 p-7 shadow-2xl shadow-brown-900/10 backdrop-blur sm:p-10">
        <div className="grid size-14 place-items-center rounded-2xl bg-caramel-400 text-2xl shadow-sm" aria-hidden="true">
          🥐
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-caramel-500">Croissant Dar</p>
        <h1 className="mt-2 text-3xl font-black text-brown-900">Admin sign in</h1>
        <p className="mt-3 leading-7 text-brown-700">Use your authorized administrator account to continue.</p>

        <AdminLoginForm />
      </section>
    </main>
  );
}
