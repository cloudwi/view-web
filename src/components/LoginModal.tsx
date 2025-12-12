"use client";

import { useEffect } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleKakaoLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    window.location.href = `${apiUrl}/auth/kakao`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="bg-card-bg border border-card-border rounded-2xl p-8 shadow-2xl">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 로고 & 타이틀 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">View에 오신 것을 환영합니다</h2>
            <p className="text-text-muted text-sm">로그인하고 당신의 관점을 공유하세요</p>
          </div>

          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-medium py-3.5 px-4 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.89 5.33 4.71 6.73-.16.57-.6 2.07-.69 2.39-.11.4.15.39.31.28.13-.08 2.04-1.38 2.87-1.94.92.14 1.87.21 2.8.21 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"/>
            </svg>
            카카오로 시작하기
          </button>

          {/* 하단 안내 */}
          <p className="text-center text-text-muted text-xs mt-6">
            로그인 시{" "}
            <a href="/terms" className="underline hover:text-foreground">이용약관</a>
            {" "}및{" "}
            <a href="/privacy" className="underline hover:text-foreground">개인정보처리방침</a>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
