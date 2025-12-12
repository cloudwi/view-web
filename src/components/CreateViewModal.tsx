"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { createView } from "@/lib/api";

interface CreateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

function CreateViewModal({ isOpen, onClose, onSuccess }: CreateViewModalProps) {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isSubmitting]);

  // 모달 닫힐 때 폼 초기화
  const resetForm = useCallback(() => {
    setTitle("");
    setOptions(["", ""]);
    setError(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  }, [isSubmitting, resetForm, onClose]);

  const handleAddOption = useCallback(() => {
    if (options.length < MAX_OPTIONS) {
      setOptions((prev) => [...prev, ""]);
    }
  }, [options.length]);

  const handleRemoveOption = useCallback((index: number) => {
    if (options.length > MIN_OPTIONS) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
    }
  }, [options.length]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    const trimmedTitle = title.trim();
    const trimmedOptions = options.map((opt) => opt.trim()).filter((opt) => opt);

    if (!trimmedTitle) {
      setError("질문을 입력해주세요.");
      return;
    }

    if (trimmedOptions.length < MIN_OPTIONS) {
      setError(`최소 ${MIN_OPTIONS}개의 선택지가 필요합니다.`);
      return;
    }

    // 중복 선택지 확인
    const uniqueOptions = new Set(trimmedOptions);
    if (uniqueOptions.size !== trimmedOptions.length) {
      setError("중복된 선택지가 있습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createView({ title: trimmedTitle, options: trimmedOptions });
      resetForm();
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "뷰 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 모달 */}
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] animate-fade-in">
        <div className="bg-card-bg border border-card-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-5 border-b border-card-border flex-shrink-0">
            <h2 className="text-xl font-bold">새로운 뷰 만들기</h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* 질문 입력 */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  질문
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="어떤 것에 대해 물어볼까요?"
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-card-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-text-muted text-right">
                  {title.length}/200
                </p>
              </div>

              {/* 선택지 입력 */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  선택지
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                        style={{
                          backgroundColor: index === 0 ? "#6366F1" : index === 1 ? "#71717A" : "#818CF8",
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`선택지 ${index + 1}`}
                        maxLength={100}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-card-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                        disabled={isSubmitting}
                      />
                      {options.length > MIN_OPTIONS && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          disabled={isSubmitting}
                          className="p-2 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* 선택지 추가 버튼 */}
                {options.length < MAX_OPTIONS && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    disabled={isSubmitting}
                    className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-card-border text-text-muted hover:border-accent-primary hover:text-accent-primary transition-colors disabled:opacity-50"
                  >
                    + 선택지 추가 ({options.length}/{MAX_OPTIONS})
                  </button>
                )}
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="p-5 border-t border-card-border flex-shrink-0">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl border border-card-border text-text-muted hover:text-foreground hover:bg-card-border/30 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl btn-glow-3d text-white font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      생성 중...
                    </span>
                  ) : (
                    "뷰 만들기"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default memo(CreateViewModal);
