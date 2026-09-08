"use client";

import { useState } from "react";

import { ProductCard } from "@/components/site/product-card";
import type {
  PublicMenuCategory,
  PublicMenuItem,
} from "@/types/public-menu";

type PublicMenuProps = {
  categories: PublicMenuCategory[];
  items: PublicMenuItem[];
  allLabel: string;
  filterLabel: string;
  unavailableLabel: string;
  noImageLabel: string;
};

const ALL_CATEGORIES = "all";

export function PublicMenu({
  categories,
  items,
  allLabel,
  filterLabel,
  unavailableLabel,
  noImageLabel,
}: PublicMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const visibleItems =
    selectedCategory === ALL_CATEGORIES
      ? items
      : items.filter((item) => item.categoryId === selectedCategory);

  return (
    <div className="mt-10">
      <div
        role="group"
        aria-label={filterLabel}
        className="overflow-x-auto pb-3 [scrollbar-width:thin]"
      >
        <div className="flex min-w-full w-max gap-2">
          <button
            type="button"
            aria-pressed={selectedCategory === ALL_CATEGORIES}
            aria-controls="menu-results"
            onClick={() => setSelectedCategory(ALL_CATEGORIES)}
            className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 ${
              selectedCategory === ALL_CATEGORIES
                ? "border-brown-900 bg-brown-900 text-cream-50"
                : "border-brown-900/15 bg-white text-brown-900 hover:border-caramel-500"
            }`}
          >
            {allLabel}
          </button>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isSelected}
                aria-controls="menu-results"
                onClick={() => setSelectedCategory(category.id)}
                className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 ${
                  isSelected
                    ? "border-brown-900 bg-brown-900 text-cream-50"
                    : "border-brown-900/15 bg-white text-brown-900 hover:border-caramel-500"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <ul id="menu-results" className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <li key={item.id}>
            <ProductCard
              item={item}
              unavailableLabel={unavailableLabel}
              noImageLabel={noImageLabel}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
