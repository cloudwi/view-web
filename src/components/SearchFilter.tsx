"use client";

import { useState, useEffect, useRef, memo } from "react";
import { SortType, VoteFilterType } from "@/types/view";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onSortChange: (sort: SortType) => void;
  currentSort: SortType;
  onVoteFilterChange?: (filter: VoteFilterType) => void;
  currentVoteFilter?: VoteFilterType;
  isLoggedIn?: boolean;
}

function SearchFilter({
  onSearch,
  onSortChange,
  currentSort,
  onVoteFilterChange,
  currentVoteFilter = "all",
  isLoggedIn = false,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounced search (300ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value), 300);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {/* 검색바 */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="뷰 검색..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-card-bg border border-card-border text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
          />
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        {/* 필터 영역 */}
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          {/* 정렬 탭 */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => onSortChange("latest")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentSort === "latest"
                  ? "bg-accent-primary text-white"
                  : "bg-card-bg text-text-muted hover:text-foreground border border-card-border"
              }`}
            >
              최신
            </button>
            <button
              onClick={() => onSortChange("popular")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentSort === "popular"
                  ? "bg-accent-primary text-white"
                  : "bg-card-bg text-text-muted hover:text-foreground border border-card-border"
              }`}
            >
              인기
            </button>
          </div>

          {/* 투표 필터 (로그인 시에만 표시) */}
          {isLoggedIn && onVoteFilterChange && (
            <div className="flex gap-1.5 flex-shrink-0 border-l border-card-border pl-3">
              <button
                onClick={() => onVoteFilterChange("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentVoteFilter === "all"
                    ? "bg-accent-primary text-white"
                    : "bg-card-bg text-text-muted hover:text-foreground border border-card-border"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => onVoteFilterChange("voted")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentVoteFilter === "voted"
                    ? "bg-accent-primary text-white"
                    : "bg-card-bg text-text-muted hover:text-foreground border border-card-border"
                }`}
              >
                투표함
              </button>
              <button
                onClick={() => onVoteFilterChange("not_voted")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentVoteFilter === "not_voted"
                    ? "bg-accent-primary text-white"
                    : "bg-card-bg text-text-muted hover:text-foreground border border-card-border"
                }`}
              >
                미투표
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(SearchFilter);