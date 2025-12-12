"use client";

interface SwipeIndicatorProps {
  total: number;
  current: number;
}

const MAX_DOTS = 7;

export default function SwipeIndicator({ total, current }: SwipeIndicatorProps) {
  // 표시할 인디케이터 범위 계산
  const getVisibleRange = () => {
    if (total <= MAX_DOTS) {
      return { start: 0, end: total };
    }

    const half = Math.floor(MAX_DOTS / 2);
    let start = current - half;
    let end = current + half + 1;

    if (start < 0) {
      start = 0;
      end = MAX_DOTS;
    } else if (end > total) {
      end = total;
      start = total - MAX_DOTS;
    }

    return { start, end };
  };

  const { start, end } = getVisibleRange();
  const showStartEllipsis = start > 0;
  const showEndEllipsis = end < total;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden flex-col items-center gap-1.5 md:flex">
      {showStartEllipsis && (
        <div className="h-1 w-1 rounded-full bg-text-muted opacity-50" />
      )}
      {Array.from({ length: end - start }).map((_, idx) => {
        const index = start + idx;
        return (
          <div
            key={index}
            className={`w-2 rounded-full transition-all duration-300 ${
              index === current
                ? "h-6 bg-accent-primary"
                : "h-2 bg-card-border hover:bg-text-muted"
            }`}
          />
        );
      })}
      {showEndEllipsis && (
        <div className="h-1 w-1 rounded-full bg-text-muted opacity-50" />
      )}
    </div>
  );
}
