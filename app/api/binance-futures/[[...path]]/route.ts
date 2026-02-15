import { NextRequest, NextResponse } from "next/server";

const BINANCE_FUTURES_API = "https://fapi.binance.com/fapi/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const subPath = path?.join("/") ?? "";
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BINANCE_FUTURES_API}/${subPath}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TradingApp/1.0)" },
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    if (data && typeof data === "object" && "code" in data && "msg" in data) {
      return NextResponse.json(data, { status: 502 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from Binance Futures" }, { status: 500 });
  }
}
