import type { ReactNode } from "react";

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
          <div>
            <p className="text-lg font-black text-brown-900">Croissant Dar Admin</p>
            <p className="mt-1 text-xs text-brown-700">{admin.email ?? admin.uid}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {children}
    </div>
  );
}
