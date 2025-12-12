"use client";

import { useState, useEffect } from "react";

interface Option {
  id: string;
  text: string;
  votes: number;
  color: string;
}

interface ViewCardProps {
  id: number;
  question: string;
  options: Option[];
  totalVotes: number;
  author?: string;
  createdAt?: string;
  myVote?: number | null;
}

export default function ViewCard({
  id,
  question,
  options: initialOptions,
  totalVotes: initialTotalVotes,
  author = "익명",
  createdAt,
  myVote,
}: ViewCardProps) {
  // 이미 투표한 경우 초기 상태 설정
  const initialVotedOption = myVote !== null && myVote !== undefined
    ? initialOptions.find(opt => opt.id === myVote.toString())?.id || null
    : null;

  const [hasVoted, setHasVoted] = useState(initialVotedOption !== null);
  const [selectedOption, setSelectedOption] = useState<string | null>(initialVotedOption);
  const [options, setOptions] = useState(initialOptions);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [showFeedback, setShowFeedback] = useState(initialVotedOption !== null);

  // props 변경 시 상태 동기화
  useEffect(() => {
    const votedOption = myVote !== null && myVote !== undefined
      ? initialOptions.find(opt => opt.id === myVote.toString())?.id || null
      : null;
    setHasVoted(votedOption !== null);
    setSelectedOption(votedOption);
    setOptions(initialOptions);
    setTotalVotes(initialTotalVotes);
    setShowFeedback(votedOption !== null);
  }, [id, myVote, initialOptions, initialTotalVotes]);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setSelectedOption(optionId);
    setHasVoted(true);
    setTotalVotes((prev) => prev + 1);
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );

    setTimeout(() => setShowFeedback(true), 500);
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
    <div className="flex h-full w-full flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-8">
      <div className="w-full max-w-lg">
        {/* Card Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent-primary" />
            <span className="text-sm text-text-muted">{author}</span>
          </div>
          {createdAt && (
            <span className="text-xs text-text-muted">{createdAt}</span>
          )}
        </div>

        {/* Question */}
        <h2 className="mb-8 text-center text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
          {question}
        </h2>

        {/* CTA before voting */}
        {!hasVoted && (
          <p className="mb-6 text-center text-sm text-text-muted animate-pulse-slow">
            너의 뷰를 보여줘
          </p>
        )}

        {/* Options */}
        <div className="space-y-4">
          {options.map((option, index) => {
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
                className={`relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
                  hasVoted
                    ? isSelected
                      ? "border-accent-primary bg-card-bg"
                      : "border-card-border bg-card-bg"
                    : "border-card-border bg-card-bg hover:border-accent-primary hover:scale-[1.02] active:scale-[0.98]"
                } ${!hasVoted && "cursor-pointer"}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Progress bar background */}
                {hasVoted && (
                  <div
                    className="absolute inset-0 opacity-20 animate-progress"
                    style={{
                      backgroundColor: option.color,
                      width: `${percentage}%`,
                    }}
                  />
                )}

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

                  {hasVoted && (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <span className="text-lg font-bold">{percentage}%</span>
                      {isWinner && (
                        <span className="text-success text-xl">👑</span>
                      )}
                      {isSelected && (
                        <span className="text-accent-primary">✓</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Vote count */}
                {hasVoted && (
                  <div className="relative z-10 mt-2 text-xs text-text-muted animate-slide-in">
                    {option.votes.toLocaleString()}표
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback message */}
        {showFeedback && (
          <div className="mt-6 rounded-xl bg-accent-primary/10 border border-accent-primary/20 p-4 text-center animate-fade-in">
            <p className="text-sm font-medium text-accent-primary">
              {getMyRank()}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              총 {totalVotes.toLocaleString()}명이 참여했어요
            </p>
          </div>
        )}

        {/* Share button */}
        {hasVoted && (
          <div className="mt-6 flex justify-center gap-3 animate-fade-in">
            <button className="flex items-center gap-2 rounded-full bg-card-bg border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card-border">
              <svg
                className="h-4 w-4"
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
              공유하기
            </button>
            <button className="flex items-center gap-2 rounded-full bg-card-bg border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card-border">
              <svg
                className="h-4 w-4"
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
              의견 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
