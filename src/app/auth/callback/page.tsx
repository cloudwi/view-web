"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 토큰을 httpOnly cookie로 설정하는 API 호출
      fetch("/api/auth/set-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then((res) => {
          if (res.ok) {
            router.push("/");
          } else {
            router.push("/login?error=auth_failed");
          }
        })
        .catch(() => {
          router.push("/login?error=auth_failed");
        });
    } else {
      router.push("/login?error=no_token");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent mx-auto" />
        <p className="text-text-muted">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent mx-auto" />
            <p className="text-text-muted">로그인 처리 중...</p>
          </div>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
