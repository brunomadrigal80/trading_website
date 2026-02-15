"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTickerBar } from "@/context/TickerContext";

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function toPairParam(symbol: string) {
  return symbol.replace("/", "-");
}

function formatPair(symbol: string) {
  return symbol.replace("USDT", "/USDT");
}

export default function MarketList() {
  const pathname = usePathname();
  const useFutures = pathname?.includes("/futures") ?? false;
  const pairs = useTickerBar();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="shrink-0 border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Markets
        </h3>
      </div>
      <div className="shrink-0 grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-[10px] text-[var(--text-muted)]">
        <span>Pair</span>
        <span className="min-w-[72px] text-right">Price</span>
        <span className="min-w-[56px] text-right">24h%</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {pairs.map((t) => {
          const pair = formatPair(t.symbol);
          const price = parseFloat(t.lastPrice);
          const change = parseFloat(t.priceChangePercent);
          return (
            <Link
              key={t.symbol}
              href={`${useFutures ? "/futures" : "/"}?pair=${toPairParam(pair)}`}
              className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-[var(--border-subtle)] px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-tertiary)] [&:active]:bg-[var(--bg-tertiary)]"
            >
              <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
                {pair}
              </span>
              <span className="min-w-[72px] whitespace-nowrap font-mono text-sm text-[var(--text-primary)] tabular-nums">
                ${isNaN(price) ? "—" : formatPrice(price)}
              </span>
              <span
                className={`min-w-[56px] font-mono text-sm font-medium tabular-nums ${
                  change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
                }`}
              >
                {isNaN(change) ? "—" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
