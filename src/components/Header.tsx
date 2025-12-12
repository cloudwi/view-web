"use client";

import Image from "next/image";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-card-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="View"
              width={120}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <button className="text-sm text-text-muted transition-colors hover:text-foreground">
              최신
            </button>
            <button className="text-sm text-text-muted transition-colors hover:text-foreground">
              인기
            </button>
            <button className="text-sm text-text-muted transition-colors hover:text-foreground">
              논쟁중
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-card-bg" />
            ) : isAuthenticated ? (
              <>
                <button className="hidden rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:block">
                  + 뷰 만들기
                </button>
                <button
                  onClick={logout}
                  className="hidden sm:block text-sm text-text-muted hover:text-foreground transition-colors px-3 py-2"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden sm:block rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                로그인
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-card-bg md:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-card-border bg-background px-4 py-4 md:hidden animate-fade-in">
            <nav className="flex flex-col gap-3">
              <button className="rounded-lg px-4 py-2 text-left text-sm text-text-muted transition-colors hover:bg-card-bg hover:text-foreground">
                최신
              </button>
              <button className="rounded-lg px-4 py-2 text-left text-sm text-text-muted transition-colors hover:bg-card-bg hover:text-foreground">
                인기
              </button>
              <button className="rounded-lg px-4 py-2 text-left text-sm text-text-muted transition-colors hover:bg-card-bg hover:text-foreground">
                논쟁중
              </button>
              {isAuthenticated ? (
                <>
                  <button className="mt-2 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-medium text-white">
                    + 뷰 만들기
                  </button>
                  <button
                    onClick={logout}
                    className="rounded-lg px-4 py-2 text-left text-sm text-text-muted transition-colors hover:bg-card-bg hover:text-foreground"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="mt-2 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-medium text-white"
                >
                  로그인
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
