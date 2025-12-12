import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ viewId: string }>;
}

// 댓글 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { viewId } = await params;
  const token = request.cookies.get("auth_token")?.value;
  const { searchParams } = new URL(request.url);

  const queryParams = new URLSearchParams();
  const perPage = searchParams.get("per_page");
  const cursor = searchParams.get("cursor");

  if (perPage) queryParams.append("per_page", perPage);
  if (cursor) queryParams.append("cursor", cursor);

  try {
    const headers: HeadersInit = {
      "Accept": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/views/${viewId}/comments?${queryParams}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "댓글을 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// 댓글 작성
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { viewId } = await params;
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/views/${viewId}/comments`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        comment: {
          content: content.trim(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "댓글 작성에 실패했습니다." },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "댓글 작성에 실패했습니다." }, { status: 500 });
  }
}