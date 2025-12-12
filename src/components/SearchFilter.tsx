"use client";

import { useState } from "react";

export type SortType = "latest" | "popular";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onSortChange: (sort: SortType) => void;
  currentSort: SortType;
}

export default function SearchFilter({
  onSearch,
  onSortChange,
  currentSort,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // 실시간 검색 (debounce 적용 권장)
    onSearch(value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* 검색바 */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="뷰 검색..."
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-card-bg border border-card-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              onSearch("");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* 정렬 탭 */}
      <div className="flex gap-2">
        <button
          onClick={() => onSortChange("latest")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentSort === "latest"
              ? "bg-accent-primary text-white"
              : "bg-card-bg text-text-muted hover:text-foreground border border-card-border"
          }`}
        >
          최신순
        </button>
        <button
          onClick={() => onSortChange("popular")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentSort === "popular"
              ? "bg-accent-primary text-white"
              : "bg-card-bg text-text-muted hover:text-foreground border border-card-border"
          }`}
        >
          투표 많은순
        </button>
      </div>
    </div>
  );
}
