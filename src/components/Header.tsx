"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, memo } from "react";
import LoginModal from "./LoginModal";
import CreateViewModal from "./CreateViewModal";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onCreateSuccess?: () => void;
}

function Header({ onCreateSuccess }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-card-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="View"
              width={120}
              height={48}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-card-bg" />
            ) : isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-3d hidden rounded-full px-4 py-2 text-sm font-medium text-white sm:block"
                >
                  + 뷰 만들기
                </button>
                {/* 유저 아이콘 드롭다운 */}
                <div className="relative group">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary transition-all hover:bg-accent-primary/30">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 top-full mt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-card-bg border border-card-border rounded-xl shadow-lg py-2">
                      <Link
                        href="/mypage"
                        className="block w-full px-4 py-2 text-left text-sm text-text-muted hover:text-foreground hover:bg-card-border/50 transition-colors"
                      >
                        마이페이지
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-sm text-text-muted hover:text-foreground hover:bg-card-border/50 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="btn-3d hidden sm:block rounded-full px-4 py-2 text-sm font-medium text-white"
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
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                    className="btn-3d rounded-full px-4 py-2 text-sm font-medium text-white"
                  >
                    + 뷰 만들기
                  </button>
                  <Link
                    href="/mypage"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-4 py-2 text-left text-sm text-text-muted transition-colors hover:bg-card-bg hover:text-accent-primary"
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="rounded-lg px-4 py-2 text-left text-sm text-text-muted transition-colors hover:bg-card-bg hover:text-accent-primary"
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
                  className="btn-3d rounded-full px-4 py-2 text-sm font-medium text-white"
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

      <CreateViewModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={onCreateSuccess}
      />
    </>
  );
}

export default memo(Header);
