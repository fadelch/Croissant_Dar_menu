import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/categories/category-form";
import { CategoryList } from "@/components/admin/categories/category-list";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CategoryServiceError } from "@/services/categories/admin/errors";
import { getAdminCategories } from "@/services/categories/admin/get-admin-categories";
import type { AdminCategory } from "@/services/categories/admin/types";

export const metadata: Metadata = {
  title: "Categories",
};

type AdminCategoriesPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const admin = await requireAdmin();
  const notice = (await searchParams).notice;
  let categories: AdminCategory[] = [];
  let loadError: string | null = null;

  try {
    categories = await getAdminCategories(admin);
  } catch (error) {
    loadError =
      error instanceof CategoryServiceError
        ? "Categories could not be loaded. Check the server configuration and try again."
        : "Categories are temporarily unavailable.";
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-caramel-500">
            Category Management
          </p>
          <h1 className="mt-2 text-3xl font-black text-brown-900 sm:text-4xl">Categories</h1>
          <p className="mt-3 max-w-2xl leading-7 text-brown-700">
            Organize the menu categories, visibility, and display order.
          </p>
        </div>
        <a
          href="#add-category"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brown-900 px-5 text-sm font-bold text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
        >
          Add Category
        </a>
      </div>

      {notice === "deleted" ? (
        <p role="status" className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Category deleted successfully.
        </p>
      ) : null}

      <section id="add-category" className="mt-10 scroll-mt-6 rounded-3xl border border-brown-900/10 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="add-category-heading">
        <h2 id="add-category-heading" className="text-2xl font-black text-brown-900">
          Add Category
        </h2>
        <p className="mt-2 text-sm leading-6 text-brown-700">
          English name, slug, and display order are required. Arabic fields are optional.
        </p>
        <div className="mt-7">
          <CategoryForm mode="create" />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="category-list-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="category-list-heading" className="text-2xl font-black text-brown-900">
              All Categories
            </h2>
            <p className="mt-2 text-sm text-brown-700">
              Active and inactive categories are both shown here.
            </p>
          </div>
          <span className="rounded-full bg-cream-100 px-3 py-1 text-sm font-bold text-brown-700">
            {categories.length} total
          </span>
        </div>

        {loadError ? (
          <p role="alert" className="rounded-3xl bg-red-50 px-5 py-4 text-red-800">
            {loadError}
          </p>
        ) : (
          <CategoryList categories={categories} />
        )}
      </section>
    </main>
  );
}
