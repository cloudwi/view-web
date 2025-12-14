"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { fetchViews, updateView, deleteView } from "@/lib/api";
import { View } from "@/types/view";
import { formatRelativeTime } from "@/lib/utils";

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [views, setViews] = useState<View[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 메뉴 상태
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 수정 모달 상태
  const [editingView, setEditingView] = useState<View | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOptions, setEditOptions] = useState<{ id: number; content: string; isDeleted: boolean }[]>([]);
  const [newOption, setNewOption] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 삭제 확인 모달 상태
  const [deletingView, setDeletingView] = useState<View | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 내 뷰 목록 조회
  const loadMyViews = useCallback(async (isInitial = true) => {
    if (isInitial) {
      setIsLoading(true);
      setCursor(null);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await fetchViews({
        author: "me",
        sort: "latest",
        cursor: isInitial ? null : cursor,
      });

      if (isInitial) {
        setViews(response.data);
      } else {
        setViews((prev) => [...prev, ...response.data]);
      }
      setHasNext(response.meta.has_next);
      setCursor(response.meta.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "뷰를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [cursor]);

  // 인증 확인 후 데이터 로드
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    loadMyViews(true);
  }, [authLoading, isAuthenticated, router]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 수정 모달 열기
  const handleEditClick = (view: View) => {
    setEditingView(view);
    setEditTitle(view.title);
    setEditOptions(view.options.map((opt) => ({ id: opt.id, content: opt.content, isDeleted: false })));
    setNewOption("");
    setOpenMenuId(null);
  };

  // 옵션 내용 수정
  const handleOptionChange = (id: number, content: string) => {
    setEditOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, content } : opt))
    );
  };

  // 옵션 삭제 토글
  const handleOptionDelete = (id: number) => {
    setEditOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, isDeleted: !opt.isDeleted } : opt))
    );
  };

  // 새 옵션 추가
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setEditOptions((prev) => [...prev, { id: -Date.now(), content: newOption.trim(), isDeleted: false }]);
    setNewOption("");
  };

  // 수정 저장
  const handleUpdateView = async () => {
    if (!editingView || !editTitle.trim() || isUpdating) return;

    const activeOptions = editOptions.filter((opt) => !opt.isDeleted);
    if (activeOptions.length < 2) {
      alert("최소 2개의 선택지가 필요합니다.");
      return;
    }

    setIsUpdating(true);
    try {
      const optionsToSend = editOptions.map((opt) => {
        if (opt.id < 0) {
          // 새로 추가된 옵션
          return { content: opt.content };
        }
        return {
          id: opt.id,
          content: opt.content,
          _destroy: opt.isDeleted,
        };
      });

      await updateView({
        viewId: editingView.id,
        title: editTitle.trim(),
        options: optionsToSend,
      });

      // 로컬 상태 업데이트
      setViews((prev) =>
        prev.map((v) =>
          v.id === editingView.id
            ? {
                ...v,
                title: editTitle.trim(),
                options: activeOptions.map((opt) => ({
                  id: opt.id < 0 ? opt.id : opt.id,
                  content: opt.content,
                  votes_count: v.options.find((o) => o.id === opt.id)?.votes_count || 0,
                })),
              }
            : v
        )
      );
      setEditingView(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 수정 모달 닫기
  const handleCloseEditModal = () => {
    setEditingView(null);
    setEditTitle("");
    setEditOptions([]);
    setNewOption("");
  };

  // 검색 필터링 (클라이언트 사이드)
  const filteredViews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return views;
    return views.filter(
      (view) =>
        view.title.toLowerCase().includes(query) ||
        view.options.some((opt) => opt.content.toLowerCase().includes(query))
    );
  }, [views, searchQuery]);

  // 삭제 확인 모달 열기
  const handleDeleteClick = (view: View) => {
    setDeletingView(view);
    setOpenMenuId(null);
  };

  // 삭제 실행
  const handleDeleteView = async () => {
    if (!deletingView || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteView(deletingView.id);
      setViews((prev) => prev.filter((v) => v.id !== deletingView.id));
      setDeletingView(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 로딩 중
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent-primary border-t-transparent" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 프로필 섹션 */}
          <div className="mb-8 p-6 bg-card-bg border border-card-border rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">마이페이지</h1>
                <p className="text-sm text-text-muted">내가 만든 뷰를 관리하세요</p>
              </div>
            </div>
          </div>

          {/* 내 뷰 목록 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">내가 만든 뷰</h2>
              <span className="text-sm text-text-muted">{filteredViews.length}개</span>
            </div>

            {/* 검색창 */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목 또는 선택지로 검색..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-card-border text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-text-muted mb-4">{error}</p>
              <button
                onClick={() => loadMyViews(true)}
                className="text-accent-primary hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : views.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-bold mb-2">아직 만든 뷰가 없어요</h3>
              <p className="text-text-muted mb-6">첫 번째 뷰를 만들어 다른 사람들의 의견을 들어보세요!</p>
              <button
                onClick={() => router.push("/")}
                className="btn-3d rounded-full px-6 py-3 text-white font-medium"
              >
                뷰 만들러 가기
              </button>
            </div>
          ) : filteredViews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-base font-bold mb-1">검색 결과가 없어요</h3>
              <p className="text-sm text-text-muted">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredViews.map((view) => (
                <div
                  key={view.id}
                  className="p-5 bg-card-bg border border-card-border rounded-2xl hover:border-accent-primary/50 transition-colors"
                >
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold line-clamp-2 flex-1 pr-2">{view.title}</h3>

                    {/* 더보기 메뉴 */}
                    <div className="relative" ref={openMenuId === view.id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === view.id ? null : view.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-card-border/50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>

                      {openMenuId === view.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-card-bg border border-card-border rounded-xl shadow-lg py-1 z-10">
                          <button
                            onClick={() => handleEditClick(view)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-card-border/50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteClick(view)}
                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-card-border/50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 선택지 목록 */}
                  <div className="space-y-2 mb-4">
                    {view.options.slice(0, 3).map((option, idx) => {
                      const percentage = view.total_votes > 0
                        ? Math.round((option.votes_count / view.total_votes) * 100)
                        : 0;
                      return (
                        <div key={option.id} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center text-xs font-bold text-accent-primary">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 text-sm text-text-muted truncate">{option.content}</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      );
                    })}
                    {view.options.length > 3 && (
                      <p className="text-xs text-text-muted">+{view.options.length - 3}개 더</p>
                    )}
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <div className="flex items-center gap-4">
                      <span>{view.total_votes}명 참여</span>
                      <span>{view.comments_count}개 댓글</span>
                    </div>
                    <span>{formatRelativeTime(view.created_at)}</span>
                  </div>
                </div>
              ))}

              {/* 더 보기 */}
              {hasNext && (
                <button
                  onClick={() => loadMyViews(false)}
                  disabled={isLoadingMore}
                  className="w-full py-4 text-center text-accent-primary hover:underline disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
                      불러오는 중...
                    </div>
                  ) : (
                    "더 보기"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 수정 모달 */}
      {editingView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseEditModal} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-card-bg border border-card-border rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">뷰 수정</h3>

            {/* 제목 */}
            <div className="mb-4">
              <label className="block text-sm text-text-muted mb-2">질문</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-card-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="질문을 입력하세요"
              />
            </div>

            {/* 선택지 */}
            <div className="mb-4">
              <label className="block text-sm text-text-muted mb-2">
                선택지 ({editOptions.filter((o) => !o.isDeleted).length}개)
              </label>
              <div className="space-y-2">
                {editOptions.map((option, idx) => (
                  <div
                    key={option.id}
                    className={`flex items-center gap-2 ${option.isDeleted ? "opacity-50" : ""}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center text-xs font-bold text-accent-primary flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={option.content}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      disabled={option.isDeleted}
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-card-border text-sm focus:outline-none focus:border-accent-primary transition-colors disabled:bg-card-border/50"
                    />
                    <button
                      onClick={() => handleOptionDelete(option.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        option.isDeleted
                          ? "text-accent-primary hover:bg-accent-primary/10"
                          : "text-text-muted hover:text-red-500 hover:bg-red-500/10"
                      }`}
                      title={option.isDeleted ? "복원" : "삭제"}
                    >
                      {option.isDeleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* 새 선택지 추가 */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOption())}
                  placeholder="새 선택지 추가..."
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-card-border text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                />
                <button
                  onClick={handleAddOption}
                  disabled={!newOption.trim()}
                  className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm text-text-muted hover:text-foreground transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateView}
                disabled={!editTitle.trim() || editOptions.filter((o) => !o.isDeleted).length < 2 || isUpdating}
                className="px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-lg disabled:opacity-50"
              >
                {isUpdating ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deletingView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingView(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-card-bg border border-card-border rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2">뷰 삭제</h3>
            <p className="text-text-muted mb-4">
              &quot;{deletingView.title}&quot;을(를) 삭제하시겠습니까?<br />
              <span className="text-red-500 text-sm">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingView(null)}
                className="px-4 py-2 text-sm text-text-muted hover:text-foreground transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteView}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
