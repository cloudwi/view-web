import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// 뷰 목록 조회
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { searchParams } = new URL(request.url);

  // 쿼리 파라미터 전달
  const params = new URLSearchParams();
  const sort = searchParams.get("sort");
  const perPage = searchParams.get("per_page");
  const cursor = searchParams.get("cursor");
  const author = searchParams.get("author");
  const voteFilter = searchParams.get("vote_filter");

  if (sort) params.append("sort", sort);
  if (perPage) params.append("per_page", perPage);
  if (cursor) params.append("cursor", cursor);
  if (author) params.append("author", author);
  if (voteFilter) params.append("vote_filter", voteFilter);

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

// 뷰 생성
export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, options } = body;

    // 유효성 검사
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "질문을 입력해주세요." }, { status: 400 });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: "최소 2개의 선택지가 필요합니다." }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/views`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        view: {
          title: title.trim(),
          view_options_attributes: options.map((opt: string) => ({ content: opt.trim() })),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "뷰 생성에 실패했습니다." },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create view error:", error);
    return NextResponse.json({ error: "뷰 생성에 실패했습니다." }, { status: 500 });
  }
}
