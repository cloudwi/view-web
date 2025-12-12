"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { Comment } from "@/types/view";
import { fetchComments, createComment } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

interface CommentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  viewId: number;
  viewTitle: string;
  commentsCount: number;
}

function CommentBottomSheet({
  isOpen,
  onClose,
  viewId,
  viewTitle,
  commentsCount: initialCommentsCount,
}: CommentBottomSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 댓글 로드
  const loadComments = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
      setCursor(null);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await fetchComments({
        viewId,
        cursor: isInitial ? null : cursor,
      });

      if (isInitial) {
        setComments(response.data);
      } else {
        setComments((prev) => [...prev, ...response.data]);
      }
      setHasNext(response.meta.has_next);
      setCursor(response.meta.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [viewId, cursor]);

  // 열릴 때 댓글 로드
  useEffect(() => {
    if (isOpen) {
      loadComments(true);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loadComments]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // 스크롤 끝 감지
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoadingMore || !hasNext) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadComments(false);
    }
  }, [isLoadingMore, hasNext, loadComments]);

  // 댓글 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createComment({ viewId, content });
      setComments((prev) => [response.data, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setNewComment("");

      // 스크롤 맨 위로
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div className="relative z-10 bg-card-bg rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-card-border" />
        </div>

        {/* 헤더 */}
        <div className="px-5 pb-3 border-b border-card-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">댓글 {commentsCount > 0 && `(${commentsCount})`}</h3>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-muted line-clamp-2">{viewTitle}</p>
        </div>

        {/* 댓글 목록 */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto min-h-0 px-5 py-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-text-muted mb-4">{error}</p>
              <button
                onClick={() => loadComments(true)}
                className="text-accent-primary hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-text-muted">첫 번째 댓글을 남겨보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-accent-primary">
                        {comment.author.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.author.nickname}</span>
                      <span className="text-xs text-text-muted">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* 더 로딩 중 */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 입력창 */}
        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 border-t border-card-border bg-card-bg"
        >
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              maxLength={500}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-full bg-background border border-card-border text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(CommentBottomSheet);