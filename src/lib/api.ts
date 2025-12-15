import { ViewsResponse, SortType, VoteFilterType, CommentsResponse, Comment, CategoriesResponse } from "@/types/view";
import { AUTH_REQUIRED_EVENT } from "@/contexts/AuthContext";

// 401 에러 발생 시 이벤트 발생
function handleUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
  }
}

// API 응답 처리 헬퍼 (401 에러 중앙화)
async function handleResponse<T>(
  response: Response,
  errorMessage: string,
  allowNoContent = false
): Promise<T> {
  if (!response.ok && !(allowNoContent && response.status === 204)) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `${errorMessage}: ${response.status}`);
  }

  if (allowNoContent && response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

interface FetchViewsParams {
  sort?: SortType;
  per_page?: number;
  cursor?: string | null;
  author?: "me" | null;
  vote_filter?: VoteFilterType;
  category?: number | null;
}

export async function fetchViews({
  sort = "latest",
  per_page = 20,
  cursor = null,
  author = null,
  vote_filter = "all",
  category = null,
}: FetchViewsParams = {}): Promise<ViewsResponse> {
  const params = new URLSearchParams({
    sort,
    per_page: per_page.toString(),
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  if (author) {
    params.append("author", author);
  }

  if (vote_filter !== "all") {
    params.append("vote_filter", vote_filter);
  }

  if (category) {
    params.append("category", category.toString());
  }

  // Next.js API Route를 통해 요청 (토큰 자동 포함)
  const response = await fetch(`/api/views?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<ViewsResponse>(response, "뷰 목록 조회 실패");
}

// 카테고리 목록 조회 API
export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch("/api/categories", {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<CategoriesResponse>(response, "카테고리 조회 실패");
}

// 투표 API (Next.js API Route를 통해 프록시)
interface VoteParams {
  viewId: number;
  viewOptionId: number;
}

interface VoteResponse {
  success: boolean;
  data?: {
    view_id: number;
    view_option_id: number;
  };
}

export async function voteOnView({ viewId, viewOptionId }: VoteParams): Promise<VoteResponse> {
  // Next.js API Route를 통해 요청 (httpOnly 쿠키 → Authorization 헤더 변환)
  const response = await fetch(`/api/views/${viewId}/vote`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ view_option_id: viewOptionId }),
  });

  return handleResponse<VoteResponse>(response, "투표 실패");
}

// 투표 취소 API
export async function cancelVote(viewId: number): Promise<void> {
  const response = await fetch(`/api/views/${viewId}/vote`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<void>(response, "투표 취소 실패", true);
}

// 뷰 생성 API
interface CreateViewParams {
  title: string;
  options: string[];
}

interface CreateViewResponse {
  data: {
    id: number;
    title: string;
  };
}

export async function createView({ title, options }: CreateViewParams): Promise<CreateViewResponse> {
  const response = await fetch("/api/views", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, options }),
  });

  return handleResponse<CreateViewResponse>(response, "뷰 생성 실패");
}

// 댓글 조회 API
interface FetchCommentsParams {
  viewId: number;
  per_page?: number;
  cursor?: string | null;
}

export async function fetchComments({
  viewId,
  per_page = 20,
  cursor = null,
}: FetchCommentsParams): Promise<CommentsResponse> {
  const params = new URLSearchParams({
    per_page: per_page.toString(),
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  const response = await fetch(`/api/views/${viewId}/comments?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<CommentsResponse>(response, "댓글 조회 실패");
}

// 댓글 작성 API
interface CreateCommentParams {
  viewId: number;
  content: string;
}

interface CreateCommentResponse {
  data: Comment;
}

export async function createComment({ viewId, content }: CreateCommentParams): Promise<CreateCommentResponse> {
  const response = await fetch(`/api/views/${viewId}/comments`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  return handleResponse<CreateCommentResponse>(response, "댓글 작성 실패");
}

// 뷰 수정 API
interface UpdateViewOption {
  id?: number;
  content: string;
  _destroy?: boolean;
}

interface UpdateViewParams {
  viewId: number;
  title: string;
  options?: UpdateViewOption[];
}

export async function updateView({ viewId, title, options }: UpdateViewParams): Promise<void> {
  const body: { view: { title: string; view_options_attributes?: UpdateViewOption[] } } = {
    view: { title: title.trim() },
  };

  if (options) {
    body.view.view_options_attributes = options;
  }

  const response = await fetch(`/api/views/${viewId}`, {
    method: "PATCH",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<void>(response, "뷰 수정 실패", true);
}

// 뷰 삭제 API
export async function deleteView(viewId: number): Promise<void> {
  const response = await fetch(`/api/views/${viewId}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<void>(response, "뷰 삭제 실패", true);
}
