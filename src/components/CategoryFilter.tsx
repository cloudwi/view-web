"use client";

import { useEffect, useState, useRef } from "react";
import { Category } from "@/types/view";
import { fetchCategories } from "@/lib/api";

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-16 animate-pulse rounded-full bg-card-border/50"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1"
    >
      {/* 전체 칩 */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          selectedCategory === null
            ? "bg-accent-primary text-white shadow-md"
            : "bg-card-bg border border-card-border text-text-secondary hover:bg-card-border"
        }`}
      >
        전체
      </button>

      {/* 카테고리 칩들 */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            selectedCategory === category.id
              ? "bg-accent-primary text-white shadow-md"
              : "bg-card-bg border border-card-border text-text-secondary hover:bg-card-border"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
