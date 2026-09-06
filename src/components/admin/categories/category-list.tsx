import { CategoryActions } from "@/components/admin/categories/category-actions";
import type { AdminCategory } from "@/services/categories/admin/types";

type CategoryListProps = {
  categories: AdminCategory[];
};

function categoryDisplayName(category: AdminCategory): string {
  return category.nameEn ?? category.nameAr;
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brown-900/20 bg-cream-50 p-8 text-center">
        <p className="font-bold text-brown-900">No categories yet.</p>
        <p className="mt-2 text-sm text-brown-700">Use the form above to create the first category.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-brown-900/10 md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-brown-900 text-sm text-cream-50">
            <tr>
              <th scope="col" className="px-5 py-4">Arabic Name</th>
              <th scope="col" className="px-5 py-4">English Name</th>
              <th scope="col" className="px-5 py-4">Slug</th>
              <th scope="col" className="px-5 py-4">Active</th>
              <th scope="col" className="px-5 py-4">Order</th>
              <th scope="col" className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brown-900/10 bg-white">
            {categories.map((category) => (
              <tr key={category.id} className="align-top">
                <td className="px-5 py-5 font-bold text-brown-900" dir="rtl">{category.nameAr}</td>
                <td className="px-5 py-5 text-brown-700">{category.nameEn ?? "—"}</td>
                <td className="px-5 py-5 font-mono text-sm text-brown-700">{category.slug}</td>
                <td className="px-5 py-5">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${category.isActive ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-700"}`}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-5 font-bold text-brown-900">{category.sortOrder}</td>
                <td className="px-5 py-5">
                  <CategoryActions
                    categoryId={category.id}
                    categoryName={categoryDisplayName(category)}
                    isActive={category.isActive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {categories.map((category) => (
          <article key={category.id} className="rounded-3xl border border-brown-900/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-brown-900" dir="rtl">{category.nameAr}</h3>
                <p className="mt-1 text-sm text-brown-700">{category.nameEn ?? "No English name"}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${category.isActive ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-700"}`}>
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <dl className="my-5 grid grid-cols-2 gap-4 border-y border-brown-900/10 py-4 text-sm">
              <div>
                <dt className="text-brown-700">Slug</dt>
                <dd className="mt-1 break-all font-mono text-brown-900">{category.slug}</dd>
              </div>
              <div>
                <dt className="text-brown-700">Display Order</dt>
                <dd className="mt-1 font-bold text-brown-900">{category.sortOrder}</dd>
              </div>
            </dl>
            <CategoryActions
              categoryId={category.id}
              categoryName={categoryDisplayName(category)}
              isActive={category.isActive}
            />
          </article>
        ))}
      </div>
    </>
  );
}
