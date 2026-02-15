import { NextRequest, NextResponse } from "next/server";

const BINANCE_API = "https://api.binance.com/api/v3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const subPath = path?.join("/") ?? "";
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BINANCE_API}/${subPath}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from Binance" }, { status: 500 });
  }
}
