import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MenuItemForm } from "@/components/admin/menu/menu-item-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { menuItemIdSchema } from "@/lib/validations/menu-item";
import { getAdminCategories } from "@/services/categories/admin/get-admin-categories";
import { getAdminMenuItem } from "@/services/menu/admin/get-admin-menu-item";
import type {
  AdminMenuItem,
  MenuCategoryOption,
} from "@/services/menu/admin/types";

export const metadata: Metadata = {
  title: "Edit Menu Item",
};

type EditMenuItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const admin = await requireAdmin();
  const result = menuItemIdSchema.safeParse((await params).id);

  if (!result.success) {
    notFound();
  }

  let item: AdminMenuItem | null;
  let categories: MenuCategoryOption[];

  try {
    [item, categories] = await Promise.all([
      getAdminMenuItem(admin, result.data),
      getAdminCategories(admin),
    ]);
  } catch {
    return (
      <main className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-3xl place-items-center px-5 py-12 text-center">
        <div>
          <h1 className="text-3xl font-black text-brown-900">Menu item unavailable</h1>
          <p className="mt-4 text-brown-700">This menu item could not be loaded. Please try again.</p>
          <Link href="/admin/menu" className="mt-7 inline-flex rounded-full bg-brown-900 px-5 py-3 text-sm font-bold text-cream-50">
            Return to Menu
          </Link>
        </div>
      </main>
    );
  }

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <Link href="/admin/menu" className="text-sm font-bold text-caramel-500 transition hover:text-brown-900">
        ← Back to Menu
      </Link>
      <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-caramel-500">
        Menu Management
      </p>
      <h1 className="mt-2 text-3xl font-black text-brown-900 sm:text-4xl">Edit Menu Item</h1>
      <p className="mt-3 leading-7 text-brown-700">
        Update product details without changing its document identity or creation timestamp.
      </p>

      <section className="mt-8 rounded-3xl border border-brown-900/10 bg-white p-5 shadow-sm sm:p-8">
        <MenuItemForm mode="edit" item={item} categories={categories} />
      </section>
    </main>
  );
}
