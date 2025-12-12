"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import ViewCard from "@/components/ViewCard";
import SwipeIndicator from "@/components/SwipeIndicator";
import SearchFilter, { SortType } from "@/components/SearchFilter";

// Sample data - will be replaced with API call
// 차분한 컬러 팔레트: 브라운 (#b87a56), 샌드 (#a68b6a), 그레이 (#5c5c5c)
const sampleViews = [
  {
    id: "1",
    question: "짜장면 vs 짬뽕, 당신의 선택은?",
    options: [
      { id: "1a", text: "짜장면", votes: 1247, color: "#b87a56" },
      { id: "1b", text: "짬뽕", votes: 1089, color: "#5c5c5c" },
    ],
    totalVotes: 2336,
    author: "지나가는 미식가",
    createdAt: "2시간 전",
    createdAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: "2",
    question: "아침형 인간 vs 저녁형 인간?",
    options: [
      { id: "2a", text: "아침형 (일찍 자고 일찍 일어남)", votes: 892, color: "#a68b6a" },
      { id: "2b", text: "저녁형 (늦게 자고 늦게 일어남)", votes: 1456, color: "#5c5c5c" },
    ],
    totalVotes: 2348,
    author: "수면 연구가",
    createdAt: "5시간 전",
    createdAtTimestamp: Date.now() - 5 * 60 * 60 * 1000,
  },
  {
    id: "3",
    question: "첫 월급, 어디에 쓸까요?",
    options: [
      { id: "3a", text: "부모님 선물", votes: 2134, color: "#b87a56" },
      { id: "3b", text: "나를 위한 선물", votes: 1876, color: "#a68b6a" },
      { id: "3c", text: "저축", votes: 1543, color: "#737373" },
    ],
    totalVotes: 5553,
    author: "사회초년생",
    createdAt: "1일 전",
    createdAtTimestamp: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: "4",
    question: "부먹 vs 찍먹, 탕수육 논쟁!",
    options: [
      { id: "4a", text: "부먹 (부어서 먹기)", votes: 1823, color: "#9a6b4a" },
      { id: "4b", text: "찍먹 (찍어서 먹기)", votes: 2156, color: "#5c5c5c" },
    ],
    totalVotes: 3979,
    author: "탕수육 마스터",
    createdAt: "3일 전",
    createdAtTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "5",
    question: "재택근무 vs 사무실 출근, 어떤 게 더 좋아요?",
    options: [
      { id: "5a", text: "재택근무", votes: 3421, color: "#b87a56" },
      { id: "5b", text: "사무실 출근", votes: 1287, color: "#5c5c5c" },
      { id: "5c", text: "하이브리드", votes: 2156, color: "#a68b6a" },
    ],
    totalVotes: 6864,
    author: "워라밸 추구자",
    createdAt: "1주 전",
    createdAtTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("latest");

  // 검색 및 정렬 적용
  const filteredViews = useMemo(() => {
    let views = [...sampleViews];

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      views = views.filter(
        (view) =>
          view.question.toLowerCase().includes(query) ||
          view.options.some((opt) => opt.text.toLowerCase().includes(query)) ||
          view.author.toLowerCase().includes(query)
      );
    }

    // 정렬
    if (sortType === "latest") {
      views.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
    } else if (sortType === "popular") {
      views.sort((a, b) => b.totalVotes - a.totalVotes);
    }

    return views;
  }, [searchQuery, sortType]);

  const totalCards = filteredViews.length + 1; // +1 for end card

  // 검색/정렬 변경 시 인덱스 리셋
  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery, sortType]);

  const goToNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 키보드 방향키 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 키보드 네비게이션 비활성화
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, totalCards]);

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
          onSortChange={setSortType}
          currentSort={sortType}
        />
      </div>

      {/* Main Content */}
      <main className="h-screen pt-44 flex items-center justify-center">
        <div className="w-full h-full relative">
          {/* View Card with animation */}
          <div
            key={`${currentIndex}-${sortType}-${searchQuery}`}
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
                <div className="mb-4 text-6xl">🎉</div>
                <h2 className="mb-2 text-2xl font-bold">모든 뷰를 확인했어요!</h2>
                <p className="mb-6 text-text-muted">
                  직접 질문을 만들어 다른 사람들의 의견을 들어보세요
                </p>
                <button className="rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90">
                  + 새로운 뷰 만들기
                </button>
              </div>
            ) : (
              <ViewCard
                id={currentView.id}
                question={currentView.question}
                options={currentView.options}
                totalVotes={currentView.totalVotes}
                author={currentView.author}
                createdAt={currentView.createdAt}
              />
            )}
          </div>
        </div>
      </main>

      {/* Navigation Buttons */}
      {filteredViews.length > 0 && (
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
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white transition-all ${
              currentIndex === totalCards - 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:scale-110 hover:opacity-90"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Floating create button for mobile */}
      <button className="fixed bottom-8 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg transition-transform hover:scale-110 sm:hidden">
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
