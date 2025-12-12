"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import ViewCard from "@/components/ViewCard";
import SwipeIndicator from "@/components/SwipeIndicator";
import SearchFilter from "@/components/SearchFilter";
import { useViews } from "@/hooks/useViews";
import { SortType } from "@/types/view";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const isInitialMount = useRef(true);

  const {
    views,
    isLoading,
    isLoadingMore,
    error,
    hasNext,
    loadMore,
    refresh,
    setSort,
    currentSort,
  } = useViews("latest");

  // 초기 로드 (한 번만)
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 정렬 변경 시 새로고침
  const handleSortChange = (sort: SortType) => {
    if (sort !== currentSort) {
      setSort(sort);
      setCurrentIndex(0);
    }
  };

  // 정렬 변경 후 데이터 다시 로드
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSort]);

  // 마지막 카드 근처에서 미리 로드
  useEffect(() => {
    if (views.length > 0 && currentIndex >= views.length - 3 && hasNext && !isLoadingMore) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, views.length, hasNext, isLoadingMore]);

  // 검색 필터 적용 (클라이언트 사이드)
  const filteredViews = searchQuery.trim()
    ? views.filter(
        (view) =>
          view.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          view.options.some((opt) =>
            opt.content.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          view.author.nickname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : views;

  const totalCards = filteredViews.length + 1; // +1 for end card

  // 검색어 변경 시 인덱스 리셋
  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : prev));
  }, [totalCards]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // 키보드 방향키 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  const currentView = filteredViews[currentIndex];
  const isEndCard = currentIndex === filteredViews.length;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />
      <SwipeIndicator total={totalCards} current={currentIndex} />

      {/* Search & Filter */}
      <div className="fixed top-20 left-0 right-0 z-30 py-4 bg-background/80 backdrop-blur-sm">
        <SearchFilter
          onSearch={setSearchQuery}
          onSortChange={handleSortChange}
          currentSort={currentSort}
        />
      </div>

      {/* Main Content */}
      <main className="h-screen pt-44 flex items-center justify-center">
        <div className="w-full h-full relative">
          {/* Loading State */}
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-accent-primary border-t-transparent mx-auto" />
                <p className="text-text-muted">뷰를 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="mb-4 text-6xl">😢</div>
                <h2 className="mb-2 text-2xl font-bold">오류가 발생했어요</h2>
                <p className="mb-6 text-text-muted">{error}</p>
                <button
                  onClick={refresh}
                  className="btn-glow-3d rounded-full px-6 py-3 font-medium text-white"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : (
            <div
              key={`${currentIndex}-${currentSort}-${searchQuery}`}
              className="absolute inset-0 flex items-center justify-center animate-fade-in"
            >
              {filteredViews.length === 0 ? (
                <div className="text-center px-4">
                  <div className="mb-4 text-6xl">🔍</div>
                  <h2 className="mb-2 text-2xl font-bold">검색 결과가 없어요</h2>
                  <p className="mb-6 text-text-muted">
                    다른 검색어로 시도해보세요
                  </p>
                </div>
              ) : isEndCard ? (
                <div className="text-center px-4">
                  {isLoadingMore ? (
                    <>
                      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-accent-primary border-t-transparent mx-auto" />
                      <p className="text-text-muted">더 불러오는 중...</p>
                    </>
                  ) : hasNext ? (
                    <>
                      <div className="mb-4 text-6xl">📥</div>
                      <h2 className="mb-2 text-2xl font-bold">더 많은 뷰 불러오기</h2>
                      <button
                        onClick={loadMore}
                        className="btn-glow-3d rounded-full px-6 py-3 font-medium text-white"
                      >
                        더 보기
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 text-6xl">🎉</div>
                      <h2 className="mb-2 text-2xl font-bold">모든 뷰를 확인했어요!</h2>
                      <p className="mb-6 text-text-muted">
                        직접 질문을 만들어 다른 사람들의 의견을 들어보세요
                      </p>
                      <button className="btn-glow-3d rounded-full px-6 py-3 font-medium text-white">
                        + 새로운 뷰 만들기
                      </button>
                    </>
                  )}
                </div>
              ) : currentView ? (
                <ViewCard
                  id={currentView.id}
                  question={currentView.title}
                  options={currentView.options.map((opt, idx) => ({
                    id: opt.id.toString(),
                    text: opt.content,
                    votes: opt.votes_count,
                    color: idx === 0 ? "#6366F1" : idx === 1 ? "#71717A" : "#818CF8",
                  }))}
                  totalVotes={currentView.total_votes}
                  author={currentView.author.nickname}
                  createdAt={formatRelativeTime(currentView.created_at)}
                  myVote={currentView.my_vote}
                />
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* Navigation Buttons */}
      {!isLoading && filteredViews.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`flex h-12 w-12 items-center justify-center rounded-full border border-card-border bg-card-bg transition-all ${
              currentIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-card-border hover:scale-110"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Page indicator */}
          <span className="text-sm text-text-muted min-w-[60px] text-center">
            {currentIndex + 1} / {totalCards}
          </span>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentIndex === totalCards - 1}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
              currentIndex === totalCards - 1
                ? "bg-accent-primary/30 cursor-not-allowed"
                : "btn-3d"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Floating create button for mobile */}
      <button className="btn-glow-pulse fixed bottom-8 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white sm:hidden">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}

// 상대 시간 포맷
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${Math.floor(diffMonth / 12)}년 전`;
}
