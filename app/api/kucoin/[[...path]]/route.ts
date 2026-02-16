import { NextRequest, NextResponse } from "next/server";

const KUCOIN_API = "https://api.kucoin.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const subPath = path?.join("/") ?? "";
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${KUCOIN_API}/${subPath}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TradingApp/1.0)" },
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    if (data && typeof data === "object" && "code" in data && data.code !== "200000") {
      return NextResponse.json(data, { status: 502 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from KuCoin" }, { status: 500 });
  }
}
