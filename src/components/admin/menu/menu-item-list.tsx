import Image from "next/image";

import { MenuItemActions } from "@/components/admin/menu/menu-item-actions";
import { formatLBP } from "@/lib/formatters/currency";
import type { AdminMenuItemRow } from "@/services/menu/admin/types";

type MenuItemListProps = {
  items: AdminMenuItemRow[];
};

function statusClass(enabled: boolean): string {
  return enabled ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-700";
}

function itemDisplayName(item: AdminMenuItemRow): string {
  return item.nameEn ?? item.nameAr;
}

function categoryName(item: AdminMenuItemRow): string {
  if (!item.category) {
    return "Missing category";
  }

  return `${item.category.nameEn}${item.category.isActive ? "" : " (Inactive)"}`;
}

function ItemImage({ item }: { item: AdminMenuItemRow }) {
  return item.imageUrl ? (
    <div className="relative size-14 overflow-hidden rounded-xl bg-cream-100">
      <Image
        src={item.imageUrl}
        alt=""
        fill
        sizes="56px"
        className="object-cover"
      />
    </div>
  ) : (
    <div className="grid size-14 place-items-center rounded-xl bg-cream-100 px-1 text-center text-[10px] text-brown-700">
      No image
    </div>
  );
}

export function MenuItemList({ items }: MenuItemListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brown-900/20 bg-cream-50 p-8 text-center">
        <p className="font-bold text-brown-900">No menu items yet.</p>
        <p className="mt-2 text-sm text-brown-700">Use the form above to create the first item.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-3xl border border-brown-900/10 md:block">
        <table className="min-w-[78rem] border-collapse text-left">
          <thead className="bg-brown-900 text-sm text-cream-50">
            <tr>
              <th scope="col" className="px-4 py-4">Image</th>
              <th scope="col" className="px-4 py-4">Arabic Name</th>
              <th scope="col" className="px-4 py-4">English Name</th>
              <th scope="col" className="px-4 py-4">Category</th>
              <th scope="col" className="px-4 py-4">Price</th>
              <th scope="col" className="px-4 py-4">Available</th>
              <th scope="col" className="px-4 py-4">Visible</th>
              <th scope="col" className="px-4 py-4">Featured</th>
              <th scope="col" className="px-4 py-4">Order</th>
              <th scope="col" className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brown-900/10 bg-white">
            {items.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-4 py-5"><ItemImage item={item} /></td>
                <td className="px-4 py-5 font-bold text-brown-900" dir="rtl">{item.nameAr}</td>
                <td className="px-4 py-5 text-brown-700">{item.nameEn ?? "—"}</td>
                <td className="px-4 py-5 text-brown-700">{categoryName(item)}</td>
                <td className="whitespace-nowrap px-4 py-5 font-bold text-brown-900">{formatLBP(item.price)}</td>
                <td className="px-4 py-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.isAvailable)}`}>{item.isAvailable ? "Available" : "Unavailable"}</span></td>
                <td className="px-4 py-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.isVisible)}`}>{item.isVisible ? "Visible" : "Hidden"}</span></td>
                <td className="px-4 py-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.isFeatured)}`}>{item.isFeatured ? "Featured" : "Not Featured"}</span></td>
                <td className="px-4 py-5 font-bold text-brown-900">{item.sortOrder}</td>
                <td className="px-4 py-5">
                  <MenuItemActions
                    menuItemId={item.id}
                    menuItemName={itemDisplayName(item)}
                    isAvailable={item.isAvailable}
                    isVisible={item.isVisible}
                    isFeatured={item.isFeatured}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-brown-900/10 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <ItemImage item={item} />
              <div className="min-w-0">
                <h3 className="font-black text-brown-900" dir="rtl">{item.nameAr}</h3>
                <p className="mt-1 text-sm text-brown-700">{item.nameEn ?? "No English name"}</p>
                <p className="mt-2 text-sm font-bold text-brown-900">{formatLBP(item.price)}</p>
              </div>
            </div>

            <dl className="my-5 grid grid-cols-2 gap-4 border-y border-brown-900/10 py-4 text-sm">
              <div>
                <dt className="text-brown-700">Category</dt>
                <dd className="mt-1 font-bold text-brown-900">{categoryName(item)}</dd>
              </div>
              <div>
                <dt className="text-brown-700">Display Order</dt>
                <dd className="mt-1 font-bold text-brown-900">{item.sortOrder}</dd>
              </div>
            </dl>

            <div className="mb-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className={`rounded-full px-3 py-1 ${statusClass(item.isAvailable)}`}>{item.isAvailable ? "Available" : "Unavailable"}</span>
              <span className={`rounded-full px-3 py-1 ${statusClass(item.isVisible)}`}>{item.isVisible ? "Visible" : "Hidden"}</span>
              <span className={`rounded-full px-3 py-1 ${statusClass(item.isFeatured)}`}>{item.isFeatured ? "Featured" : "Not Featured"}</span>
            </div>

            <MenuItemActions
              menuItemId={item.id}
              menuItemName={itemDisplayName(item)}
              isAvailable={item.isAvailable}
              isVisible={item.isVisible}
              isFeatured={item.isFeatured}
            />
          </article>
        ))}
      </div>
    </>
  );
}
