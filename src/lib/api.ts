import { ViewsResponse, SortType } from "@/types/view";

interface FetchViewsParams {
  sort?: SortType;
  per_page?: number;
  cursor?: string | null;
}

export async function fetchViews({
  sort = "latest",
  per_page = 20,
  cursor = null,
}: FetchViewsParams = {}): Promise<ViewsResponse> {
  const params = new URLSearchParams({
    sort,
    per_page: per_page.toString(),
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  // Next.js API Route를 통해 요청 (토큰 자동 포함)
  const response = await fetch(`/api/views?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch views: ${response.status}`);
  }

  return response.json();
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

  if (!response.ok) {
    throw new Error(`Failed to vote: ${response.status}`);
  }

  return response.json();
}

// 투표 취소 API
export async function cancelVote(viewId: number): Promise<void> {
  const response = await fetch(`/api/views/${viewId}/vote`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to cancel vote: ${response.status}`);
  }
}
