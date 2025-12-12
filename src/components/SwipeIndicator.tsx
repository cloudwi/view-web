"use client";

import { useMemo, memo } from "react";

interface SwipeIndicatorProps {
  total: number;
  current: number;
}

const MAX_DOTS = 7;

function SwipeIndicator({ total, current }: SwipeIndicatorProps) {
  const { start, end, showStartEllipsis, showEndEllipsis } = useMemo(() => {
    if (total <= MAX_DOTS) {
      return { start: 0, end: total, showStartEllipsis: false, showEndEllipsis: false };
    }

    const half = Math.floor(MAX_DOTS / 2);
    let s = current - half;
    let e = current + half + 1;

    if (s < 0) {
      s = 0;
      e = MAX_DOTS;
    } else if (e > total) {
      e = total;
      s = total - MAX_DOTS;
    }

    return { start: s, end: e, showStartEllipsis: s > 0, showEndEllipsis: e < total };
  }, [total, current]);

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

export default memo(SwipeIndicator);
