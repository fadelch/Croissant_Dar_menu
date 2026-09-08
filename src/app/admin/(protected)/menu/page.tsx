import type { Metadata } from "next";

import { MenuItemForm } from "@/components/admin/menu/menu-item-form";
import { MenuItemList } from "@/components/admin/menu/menu-item-list";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminMenuData } from "@/services/menu/admin/get-admin-menu-items";
import type {
  AdminMenuItemRow,
  MenuCategoryOption,
} from "@/services/menu/admin/types";

export const metadata: Metadata = {
  title: "Menu Management",
};

type AdminMenuPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default async function AdminMenuPage({ searchParams }: AdminMenuPageProps) {
  const admin = await requireAdmin();
  const notice = (await searchParams).notice;
  let items: AdminMenuItemRow[] = [];
  let categories: MenuCategoryOption[] = [];
  let loadError: string | null = null;

  try {
    const data = await getAdminMenuData(admin);
    items = data.items;
    categories = data.categories;
  } catch {
    loadError = "Menu items could not be loaded. Check the server configuration and try again.";
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-caramel-500">
            Menu Management
          </p>
          <h1 className="mt-2 text-3xl font-black text-brown-900 sm:text-4xl">Menu Items</h1>
          <p className="mt-3 max-w-2xl leading-7 text-brown-700">
            Manage products, prices, categories, visibility, availability, and featured status.
          </p>
        </div>
        <a
          href="#add-menu-item"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brown-900 px-5 text-sm font-bold text-cream-50"
        >
          Add Menu Item
        </a>
      </div>

      {notice === "deleted" ? (
        <p role="status" className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Menu item deleted successfully.
        </p>
      ) : null}

      {loadError ? (
        <p role="alert" className="mt-8 rounded-3xl bg-red-50 px-5 py-4 text-red-800">
          {loadError}
        </p>
      ) : (
        <>
          <section
            id="add-menu-item"
            className="mt-10 scroll-mt-6 rounded-3xl border border-brown-900/10 bg-white p-5 shadow-sm sm:p-8"
            aria-labelledby="add-menu-item-heading"
          >
            <h2 id="add-menu-item-heading" className="text-2xl font-black text-brown-900">
              Add Menu Item
            </h2>
            <p className="mt-2 text-sm leading-6 text-brown-700">
              Arabic name, category, integer LBP price, and display order are required.
            </p>

            {categories.length === 0 ? (
              <p role="alert" className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Create a category before adding a menu item.
              </p>
            ) : null}

            <div className="mt-7">
              <MenuItemForm mode="create" categories={categories} />
            </div>
          </section>

          <section className="mt-12" aria-labelledby="menu-list-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 id="menu-list-heading" className="text-2xl font-black text-brown-900">
                  All Menu Items
                </h2>
                <p className="mt-2 text-sm text-brown-700">
                  Visible, hidden, available, unavailable, featured, and regular items are shown.
                </p>
              </div>
              <span className="rounded-full bg-cream-100 px-3 py-1 text-sm font-bold text-brown-700">
                {items.length} total
              </span>
            </div>
            <MenuItemList items={items} />
          </section>
        </>
      )}
    </main>
  );
}
