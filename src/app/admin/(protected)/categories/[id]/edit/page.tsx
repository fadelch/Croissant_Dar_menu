import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/categories/category-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { categoryIdSchema } from "@/lib/validations/category";
import { getAdminCategory } from "@/services/categories/admin/get-admin-categories";
import type { AdminCategory } from "@/services/categories/admin/types";

export const metadata: Metadata = {
  title: "Edit Category",
};

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const admin = await requireAdmin();
  const result = categoryIdSchema.safeParse((await params).id);

  if (!result.success) {
    notFound();
  }

  let category: AdminCategory | null;

  try {
    category = await getAdminCategory(admin, result.data);
  } catch {
    return (
      <main className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-3xl place-items-center px-5 py-12 text-center">
        <div>
          <h1 className="text-3xl font-black text-brown-900">Category unavailable</h1>
          <p className="mt-4 text-brown-700">
            This category could not be loaded. Please try again.
          </p>
          <Link
            href="/admin/categories"
            className="mt-7 inline-flex rounded-full bg-brown-900 px-5 py-3 text-sm font-bold text-cream-50"
          >
            Return to Categories
          </Link>
        </div>
      </main>
    );
  }

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <Link
        href="/admin/categories"
        className="text-sm font-bold text-caramel-500 transition hover:text-brown-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
      >
        ← Back to Categories
      </Link>
      <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-caramel-500">
        Category Management
      </p>
      <h1 className="mt-2 text-3xl font-black text-brown-900 sm:text-4xl">Edit Category</h1>
      <p className="mt-3 leading-7 text-brown-700">
        Update category details without changing its identity or creation timestamp.
      </p>

      <section className="mt-8 rounded-3xl border border-brown-900/10 bg-white p-5 shadow-sm sm:p-8">
        <CategoryForm mode="edit" category={category} />
      </section>
    </main>
  );
}
