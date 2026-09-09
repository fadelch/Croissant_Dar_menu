import type { Metadata } from "next";
import Image from "next/image";
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
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-cream-50 px-5 py-12">
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/croissant-dar-logo.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover opacity-[0.16] blur-[1px]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,250,241,0.90),rgba(250,233,210,0.70)_48%,rgba(57,35,25,0.18))]"
      />
      <div aria-hidden="true" className="absolute -start-24 top-8 -z-10 size-80 rounded-full bg-caramel-400/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -end-24 bottom-0 -z-10 size-96 rounded-full bg-cream-100/80 blur-3xl" />

      <section className="relative w-full min-w-0 max-w-md rounded-[2rem] border border-brown-900/12 bg-white/88 p-7 shadow-2xl shadow-brown-900/15 backdrop-blur-md sm:p-10">
        <div className="relative h-32 w-full overflow-hidden" aria-hidden="true">
          <Image
            src="/croissant-dar-logo.png"
            alt=""
            fill
            priority
            sizes="(min-width: 640px) 368px, calc(100vw - 96px)"
            className="object-contain"
          />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-caramel-500">Croissant Dar</p>
        <h1 className="mt-2 text-3xl font-black text-brown-900">Admin sign in</h1>
        <p className="mt-3 leading-7 text-brown-700">Use your authorized administrator account to continue.</p>

        <AdminLoginForm />
      </section>
    </main>
  );
}
