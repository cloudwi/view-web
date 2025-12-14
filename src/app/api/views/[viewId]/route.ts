import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ viewId: string }>;
}

// 뷰 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { viewId } = await params;
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/views/${viewId}`, {
      method: "PATCH",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || "뷰 수정에 실패했습니다." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Update view error:", error);
    return NextResponse.json({ error: "뷰 수정에 실패했습니다." }, { status: 500 });
  }
}

// 뷰 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { viewId } = await params;
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/views/${viewId}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || "뷰 삭제에 실패했습니다." },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete view error:", error);
    return NextResponse.json({ error: "뷰 삭제에 실패했습니다." }, { status: 500 });
  }
}
