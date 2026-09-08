import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { requireAdmin } from "@/lib/auth/require-admin";

type ProtectedAdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ProtectedAdminLayout({ children }: ProtectedAdminLayoutProps) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh bg-cream-50">
      <header className="border-b border-brown-900/10 bg-white/75 backdrop-blur">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
            <div>
              <p className="text-lg font-black text-brown-900">Croissant Dar Admin</p>
              <p className="mt-1 truncate text-xs text-brown-700">{admin.email ?? admin.uid}</p>
            </div>
            <nav aria-label="Admin navigation" className="flex items-center gap-4 text-sm font-bold text-brown-700">
              <Link href="/admin" className="transition hover:text-caramel-500">Dashboard</Link>
              <Link href="/admin/categories" className="transition hover:text-caramel-500">Categories</Link>
              <Link href="/admin/menu" className="transition hover:text-caramel-500">Menu</Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      {children}
    </div>
  );
}
