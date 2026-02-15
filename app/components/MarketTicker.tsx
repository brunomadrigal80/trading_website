"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTickerBar } from "@/context/TickerContext";

function toPairParam(symbol: string) {
  return symbol.replace("/", "-");
}

function formatPair(symbol: string) {
  if (symbol.endsWith("USDT")) return symbol.replace("USDT", "/USDT");
  return symbol;
}

function formatPrice(price: string): string {
  const n = parseFloat(price);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function MarketTicker() {
  const searchParams = useSearchParams();
  const currentPair = searchParams.get("pair")?.replace("-", "/") ?? "BTC/USDT";
  const tickers = useTickerBar();
  const pairs = tickers;

  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2">
      {pairs.map((t) => {
        const pairStr = formatPair(t.symbol);
        const href = `/?pair=${toPairParam(pairStr)}`;
        const isActive = currentPair === pairStr;
        const change = parseFloat(t.priceChangePercent);
        const changeStr = Number.isFinite(change) ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "—";

        return (
          <Link
            key={t.symbol}
            href={href}
            className={`flex shrink-0 items-center gap-3 rounded px-3 py-1.5 transition-colors hover:bg-[var(--bg-tertiary)] ${
              isActive ? "bg-[var(--bg-tertiary)] ring-1 ring-[var(--border)]" : ""
            }`}
          >
            <span className="font-mono text-sm font-medium text-[var(--text-primary)]">{pairStr}</span>
            <span className="font-mono text-sm text-[var(--text-secondary)]">${formatPrice(t.lastPrice)}</span>
            <span
              className={`font-mono text-xs font-medium ${
                Number.isFinite(change) && change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
              }`}
            >
              {changeStr}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
