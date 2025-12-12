"use client";

import { useState, useCallback } from "react";
import { View, SortType } from "@/types/view";
import { fetchViews } from "@/lib/api";

interface UseViewsReturn {
  views: View[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setSort: (sort: SortType) => void;
  currentSort: SortType;
}

export function useViews(initialSort: SortType = "latest"): UseViewsReturn {
  const [views, setViews] = useState<View[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortType>(initialSort);

  // 초기 로드 또는 새로고침
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchViews({ sort: currentSort, cursor: null });
      setViews(response.data);
      setHasNext(response.meta.has_next);
      setCursor(response.meta.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load views");
    } finally {
      setIsLoading(false);
    }
  }, [currentSort]);

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNext || !cursor) return;

    setIsLoadingMore(true);
    try {
      const response = await fetchViews({ sort: currentSort, cursor });
      setViews((prev) => [...prev, ...response.data]);
      setHasNext(response.meta.has_next);
      setCursor(response.meta.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more views");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentSort, cursor, hasNext, isLoadingMore]);

  // 정렬 변경
  const setSort = useCallback((sort: SortType) => {
    if (sort !== currentSort) {
      setCurrentSort(sort);
      setViews([]);
      setCursor(null);
    }
  }, [currentSort]);

  return {
    views,
    isLoading,
    isLoadingMore,
    error,
    hasNext,
    loadMore,
    refresh,
    setSort,
    currentSort,
  };
}
