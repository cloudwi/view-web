"use client";

interface SwipeIndicatorProps {
  total: number;
  current: number;
}

export default function SwipeIndicator({ total, current }: SwipeIndicatorProps) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden flex-col gap-2 md:flex">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            index === current
              ? "h-6 bg-accent-primary"
              : "bg-card-border hover:bg-text-muted"
          }`}
        />
      ))}
    </div>
  );
}
