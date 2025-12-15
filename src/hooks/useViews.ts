"use client";

import { useState, useCallback, useRef } from "react";
import { View, SortType, VoteFilterType } from "@/types/view";
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
  setVoteFilter: (filter: VoteFilterType) => void;
  currentVoteFilter: VoteFilterType;
  setCategory: (category: number | null) => void;
  currentCategory: number | null;
  updateViewVote: (viewId: number, optionId: number) => void;
  cancelViewVote: (viewId: number) => void;
}

export function useViews(initialSort: SortType = "latest"): UseViewsReturn {
  const [views, setViews] = useState<View[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortType>(initialSort);
  const [currentVoteFilter, setCurrentVoteFilter] = useState<VoteFilterType>("all");
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);

  const cursorRef = useRef<string | null>(null);
  const sortRef = useRef<SortType>(initialSort);
  const voteFilterRef = useRef<VoteFilterType>("all");
  const categoryRef = useRef<number | null>(null);
  sortRef.current = currentSort;
  voteFilterRef.current = currentVoteFilter;
  categoryRef.current = currentCategory;

  // 초기 로드 또는 새로고침
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    cursorRef.current = null;
    try {
      const response = await fetchViews({
        sort: sortRef.current,
        cursor: null,
        vote_filter: voteFilterRef.current,
        category: categoryRef.current,
      });
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
      const response = await fetchViews({
        sort: sortRef.current,
        cursor: cursorRef.current,
        vote_filter: voteFilterRef.current,
        category: categoryRef.current,
      });
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

  // 투표 필터 변경
  const setVoteFilter = useCallback((filter: VoteFilterType) => {
    if (filter !== voteFilterRef.current) {
      setCurrentVoteFilter(filter);
      setViews([]);
      cursorRef.current = null;
    }
  }, []);

  // 카테고리 변경
  const setCategory = useCallback((category: number | null) => {
    if (category !== categoryRef.current) {
      setCurrentCategory(category);
      setViews([]);
      cursorRef.current = null;
    }
  }, []);

  // 투표 상태 업데이트
  const updateViewVote = useCallback((viewId: number, optionId: number) => {
    setViews((prev) =>
      prev.map((view) => {
        if (view.id !== viewId) return view;
        return {
          ...view,
          my_vote: { option_id: optionId },
          total_votes: view.total_votes + 1,
          options: view.options.map((opt) =>
            opt.id === optionId
              ? { ...opt, votes_count: opt.votes_count + 1 }
              : opt
          ),
        };
      })
    );
  }, []);

  // 투표 취소 상태 업데이트
  const cancelViewVote = useCallback((viewId: number) => {
    setViews((prev) =>
      prev.map((view) => {
        if (view.id !== viewId) return view;
        const previousOptionId = view.my_vote?.option_id;
        return {
          ...view,
          my_vote: null,
          total_votes: view.total_votes - 1,
          options: view.options.map((opt) =>
            opt.id === previousOptionId
              ? { ...opt, votes_count: opt.votes_count - 1 }
              : opt
          ),
        };
      })
    );
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
    setVoteFilter,
    currentVoteFilter,
    setCategory,
    currentCategory,
    updateViewVote,
    cancelViewVote,
  };
}
