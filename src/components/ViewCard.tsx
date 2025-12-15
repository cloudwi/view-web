"use client";

import { useState, useEffect, memo } from "react";
import { voteOnView, cancelVote } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import CommentBottomSheet from "./CommentBottomSheet";

interface Option {
  id: string;
  text: string;
  votes: number;
  color: string;
}

interface MyVote {
  option_id: number;
}

interface ViewCardProps {
  id: number;
  question: string;
  options: Option[];
  totalVotes: number;
  author?: string;
  createdAt?: string;
  myVote?: MyVote | null;
  commentsCount?: number;
  onVoteUpdate?: (viewId: number, optionId: number) => void;
  onVoteCancel?: (viewId: number) => void;
}

function ViewCard({
  id,
  question,
  options: initialOptions,
  totalVotes: initialTotalVotes,
  author = "익명",
  createdAt,
  myVote,
  commentsCount: initialCommentsCount = 0,
  onVoteUpdate,
  onVoteCancel,
}: ViewCardProps) {
  const { isAuthenticated, openLoginModal } = useAuth();

  // 이미 투표한 경우 초기 상태 설정
  const initialVotedOption = myVote?.option_id
    ? initialOptions.find(opt => opt.id === myVote.option_id.toString())?.id || null
    : null;

  const [hasVoted, setHasVoted] = useState(initialVotedOption !== null);
  const [selectedOption, setSelectedOption] = useState<string | null>(initialVotedOption);
  const [options, setOptions] = useState(initialOptions);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [showFeedback, setShowFeedback] = useState(initialVotedOption !== null);
  const [isVoting, setIsVoting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  const MAX_VISIBLE_OPTIONS = 5;

  // props 변경 시 상태 동기화
  useEffect(() => {
    const votedOption = myVote?.option_id
      ? initialOptions.find(opt => opt.id === myVote.option_id.toString())?.id || null
      : null;
    setHasVoted(votedOption !== null);
    setSelectedOption(votedOption);
    setOptions(initialOptions);
    setTotalVotes(initialTotalVotes);
    setShowFeedback(votedOption !== null);
    setShowAllOptions(false);
    setIsCommentOpen(false);
    setCommentsCount(initialCommentsCount);
  }, [id, myVote, initialOptions, initialTotalVotes, initialCommentsCount]);

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;

    // 로그인 상태 확인
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setIsVoting(true);

    // Optimistic update
    setSelectedOption(optionId);
    setHasVoted(true);
    setTotalVotes((prev) => prev + 1);
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );

    try {
      await voteOnView({
        viewId: id,
        viewOptionId: parseInt(optionId, 10),
      });
      onVoteUpdate?.(id, parseInt(optionId, 10));
      setTimeout(() => setShowFeedback(true), 500);
    } catch (error) {
      // Rollback on error
      setSelectedOption(null);
      setHasVoted(false);
      setTotalVotes((prev) => prev - 1);
      setOptions((prev) =>
        prev.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes - 1 } : opt
        )
      );
      console.error("투표 실패:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCancelVote = async () => {
    if (!hasVoted || isCanceling || !selectedOption) return;

    setIsCanceling(true);
    const previousOption = selectedOption;

    // Optimistic update
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === previousOption ? { ...opt, votes: opt.votes - 1 } : opt
      )
    );
    setTotalVotes((prev) => prev - 1);
    setSelectedOption(null);
    setHasVoted(false);
    setShowFeedback(false);

    try {
      await cancelVote(id);
      onVoteCancel?.(id);
    } catch (error) {
      // Rollback on error
      setOptions((prev) =>
        prev.map((opt) =>
          opt.id === previousOption ? { ...opt, votes: opt.votes + 1 } : opt
        )
      );
      setTotalVotes((prev) => prev + 1);
      setSelectedOption(previousOption);
      setHasVoted(true);
      setShowFeedback(true);
      console.error("투표 취소 실패:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getMyRank = () => {
    if (!selectedOption) return null;
    const selectedOpt = options.find((o) => o.id === selectedOption);
    if (!selectedOpt) return null;
    const percentage = getPercentage(selectedOpt.votes);
    if (percentage <= 10) return "상위 10%의 독특한 관점!";
    if (percentage <= 30) return "소수의 관점을 가졌군요!";
    if (percentage >= 70) return "대중적인 시선이네요!";
    return "균형 잡힌 관점이에요!";
  };

  return (
    <div className="flex h-full w-full flex-col items-center px-4 py-4 sm:px-6 md:px-8 select-none">
      <div className="w-full max-w-lg flex flex-col max-h-full">
        {/* Card Header */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent-primary" />
            <span className="text-sm text-text-muted">{author}</span>
          </div>
          {createdAt && (
            <span className="text-xs text-text-muted">{createdAt}</span>
          )}
        </div>

        {/* Question */}
        <h2 className="mb-4 text-center text-xl font-bold leading-tight sm:text-2xl md:text-3xl flex-shrink-0">
          {question}
        </h2>

        {/* CTA / 투표 상태 표시 */}
        <div className="flex-shrink-0">
          {hasVoted ? (
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-primary/20 px-3 py-1 text-sm font-medium text-accent-primary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                투표함
              </span>
            </div>
          ) : (
            <p className="mb-4 text-center text-sm text-text-muted animate-pulse-slow">
              너의 뷰를 보여줘
            </p>
          )}
        </div>

        {/* Options */}
        <div className="flex-1 min-h-0 mb-4 overflow-hidden">
          <div className="space-y-3 h-full overflow-y-auto overflow-x-hidden pr-1">
          {(showAllOptions ? options : options.slice(0, MAX_VISIBLE_OPTIONS)).map((option, index) => {
            const percentage = getPercentage(option.votes);
            const isSelected = selectedOption === option.id;
            const isWinner =
              hasVoted &&
              option.votes === Math.max(...options.map((o) => o.votes));

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 select-none ${
                  hasVoted
                    ? isSelected
                      ? "border-accent-primary bg-card-bg cursor-default"
                      : "border-card-border bg-card-bg cursor-default"
                    : "border-card-border bg-card-bg hover:border-accent-primary hover:bg-card-border/30 active:bg-card-border/50 cursor-pointer"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundColor: option.color,
                    width: `${percentage}%`,
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: option.color }}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option.text}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{percentage}%</span>
                    {isWinner && totalVotes > 0 && (
                      <span className="text-success text-xl">👑</span>
                    )}
                    {isSelected && (
                      <span className="text-accent-primary">✓</span>
                    )}
                  </div>
                </div>

                {/* Vote count */}
                <div className="relative z-10 mt-2 text-xs text-text-muted">
                  {option.votes.toLocaleString()}표
                </div>
              </button>
            );
          })}

          {/* 더 보기 버튼 */}
          {options.length > MAX_VISIBLE_OPTIONS && !showAllOptions && (
            <button
              onClick={() => setShowAllOptions(true)}
              className="w-full py-3 text-sm text-text-muted hover:text-accent-primary transition-colors flex items-center justify-center gap-2"
            >
              <span>+{options.length - MAX_VISIBLE_OPTIONS}개 더 보기</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* 접기 버튼 */}
          {options.length > MAX_VISIBLE_OPTIONS && showAllOptions && (
            <button
              onClick={() => setShowAllOptions(false)}
              className="w-full py-3 text-sm text-text-muted hover:text-accent-primary transition-colors flex items-center justify-center gap-2"
            >
              <span>접기</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          </div>
        </div>

        {/* 하단 고정 영역 */}
        <div className="flex-shrink-0">
          {/* Feedback message */}
          {showFeedback && (
            <div className="mb-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20 p-3 text-center animate-fade-in">
              <p className="text-sm font-medium text-accent-primary">
                {getMyRank()}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                총 {totalVotes.toLocaleString()}명이 참여했어요
              </p>
            </div>
          )}

          {/* Action buttons */}
          {hasVoted && (
            <div className="flex flex-col gap-2 animate-fade-in">
              <div className="flex justify-center gap-2">
                <button className="flex items-center gap-1.5 rounded-full bg-card-bg border border-card-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-card-border">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  공유
                </button>
                <button
                  onClick={() => setIsCommentOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-card-bg border border-card-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-card-border"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  의견{commentsCount > 0 && ` ${commentsCount}`}
                </button>
                <button
                  onClick={handleCancelVote}
                  disabled={isCanceling}
                  className="flex items-center gap-1.5 rounded-full bg-card-bg border border-card-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-card-border hover:text-foreground disabled:opacity-50"
                >
                  {isCanceling ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
                      취소 중
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      취소
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 댓글 바텀 시트 */}
      <CommentBottomSheet
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        viewId={id}
        viewTitle={question}
        commentsCount={commentsCount}
      />
    </div>
  );
}

export default memo(ViewCard);
