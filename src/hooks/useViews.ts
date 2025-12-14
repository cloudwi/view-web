"use client";

import { useState, useCallback, useRef } from "react";
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
  const [currentSort, setCurrentSort] = useState<SortType>(initialSort);

  const cursorRef = useRef<string | null>(null);
  const sortRef = useRef<SortType>(initialSort);
  sortRef.current = currentSort;

  // 초기 로드 또는 새로고침
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    cursorRef.current = null;
    try {
      const response = await fetchViews({ sort: sortRef.current, cursor: null });
      setViews(response.data);
      setHasNext(response.meta.has_next);
      cursorRef.current = response.meta.next_cursor;
    } catch (err) {
      setError(err instanceof Error ? err.message : "뷰를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (!cursorRef.current) return;

    setIsLoadingMore(true);
    try {
      const response = await fetchViews({ sort: sortRef.current, cursor: cursorRef.current });
      setViews((prev) => [...prev, ...response.data]);
      setHasNext(response.meta.has_next);
      cursorRef.current = response.meta.next_cursor;
    } catch (err) {
      setError(err instanceof Error ? err.message : "뷰를 더 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  // 정렬 변경
  const setSort = useCallback((sort: SortType) => {
    if (sort !== sortRef.current) {
      setCurrentSort(sort);
      setViews([]);
      cursorRef.current = null;
    }
  }, []);

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
