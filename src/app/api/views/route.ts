import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { searchParams } = new URL(request.url);

  // 쿼리 파라미터 전달
  const params = new URLSearchParams();
  const sort = searchParams.get("sort");
  const perPage = searchParams.get("per_page");
  const cursor = searchParams.get("cursor");

  if (sort) params.append("sort", sort);
  if (perPage) params.append("per_page", perPage);
  if (cursor) params.append("cursor", cursor);

  try {
    const headers: HeadersInit = {
      "Accept": "application/json",
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/views?${params}`, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch views error:", error);
    return NextResponse.json({ error: "Failed to fetch views" }, { status: 500 });
  }
}
