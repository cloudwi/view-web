"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import ViewCard from "@/components/ViewCard";
import SwipeIndicator from "@/components/SwipeIndicator";
import SearchFilter from "@/components/SearchFilter";
import CreateViewModal from "@/components/CreateViewModal";
import { useViews } from "@/hooks/useViews";
import { formatRelativeTime } from "@/lib/utils";
import { SortType } from "@/types/view";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // 초기 로드 및 정렬 변경 시 새로고침
  useEffect(() => {
    refresh();
  }, [currentSort, refresh]);

  const handleSortChange = useCallback((sort: SortType) => {
    setSort(sort);
    setCurrentIndex(0);
  }, [setSort]);

  // 뷰 생성 성공 시 새로고침 및 첫 번째 카드로 이동
  const handleCreateSuccess = useCallback(() => {
    setCurrentIndex(0);
    refresh();
  }, [refresh]);

  // 마지막 카드 근처에서 미리 로드
  useEffect(() => {
    if (views.length > 0 && currentIndex >= views.length - 3 && hasNext && !isLoadingMore) {
      loadMore();
    }
  }, [currentIndex, views.length, hasNext, isLoadingMore, loadMore]);

  // 검색 필터 적용 (클라이언트 사이드)
  const filteredViews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return views;
    return views.filter(
      (view) =>
        view.title.toLowerCase().includes(query) ||
        view.options.some((opt) => opt.content.toLowerCase().includes(query)) ||
        view.author.nickname.toLowerCase().includes(query)
    );
  }, [views, searchQuery]);

  const totalCards = filteredViews.length + 1;

  // 검색어 변경 핸들러 (인덱스 리셋 포함)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentIndex(0);
  }, []);

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
      <Header onCreateSuccess={handleCreateSuccess} />
      <SwipeIndicator total={totalCards} current={currentIndex} />

      {/* Search & Filter */}
      <div className="fixed top-16 left-0 right-0 z-30 py-3 bg-background/90 backdrop-blur-sm border-b border-card-border/50">
        <SearchFilter
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          currentSort={currentSort}
        />
      </div>

      {/* Main Content - 헤더(64px) + 검색창(약 56px) + 하단 네비게이션 여백 */}
      <main className="h-screen pt-36 pb-24 flex items-start justify-center">
        <div className="w-full h-full relative">
          {/* Loading State */}
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-accent-primary border-t-transparent mx-auto" />
                <p className="text-text-muted mb-2">뷰를 불러오는 중...</p>
                <p className="text-xs text-text-muted/70">
                  서버가 절전 모드에서 깨어나는 중일 수 있어요.<br />
                  최대 1분 정도 소요될 수 있습니다.
                </p>
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
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-glow-3d rounded-full px-6 py-3 font-medium text-white"
                      >
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
                  commentsCount={currentView.comments_count}
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
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="btn-glow-pulse fixed bottom-8 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white sm:hidden"
      >
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

      {/* Create View Modal */}
      <CreateViewModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
