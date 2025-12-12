import { ViewsResponse, SortType } from "@/types/view";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

  const response = await fetch(`${API_BASE_URL}/views?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    credentials: "include", // 쿠키 포함
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch views: ${response.status}`);
  }

  return response.json();
}
