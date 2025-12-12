"use client";

import { useEffect, useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  // 모달 닫힐 때 로딩 상태 초기화
  useEffect(() => {
    if (!isOpen) setIsLoading(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKakaoLogin = () => {
    setIsLoading(true);
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
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FDD800] disabled:bg-[#FEE500]/70 text-[#191919] font-medium py-3.5 px-4 rounded-xl transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                카카오 로그인 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.89 5.33 4.71 6.73-.16.57-.6 2.07-.69 2.39-.11.4.15.39.31.28.13-.08 2.04-1.38 2.87-1.94.92.14 1.87.21 2.8.21 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"/>
                </svg>
                카카오로 시작하기
              </>
            )}
          </button>

          {/* 하단 안내 */}
          <p className="text-center text-text-muted text-xs mt-6">
            로그인 시{" "}
            <a href="/terms" className="underline hover:text-accent-primary">이용약관</a>
            {" "}및{" "}
            <a href="/privacy" className="underline hover:text-accent-primary">개인정보처리방침</a>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
