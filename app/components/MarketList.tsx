"use client";

import Link from "next/link";

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function toPairParam(symbol: string) {
  return symbol.replace("/", "-");
}

const markets = [
  { pair: "BTC/USDT", price: 97432.45, change: 2.34, volume: "28.2B" },
  { pair: "ETH/USDT", price: 3621.28, change: -0.87, volume: "12.1B" },
  { pair: "SOL/USDT", price: 218.94, change: 5.12, volume: "3.4B" },
  { pair: "BNB/USDT", price: 642.11, change: 1.22, volume: "1.2B" },
  { pair: "XRP/USDT", price: 2.34, change: -2.15, volume: "2.8B" },
  { pair: "DOGE/USDT", price: 0.42, change: 8.45, volume: "1.9B" },
  { pair: "AVAX/USDT", price: 38.92, change: 3.67, volume: "0.5B" },
  { pair: "LINK/USDT", price: 14.21, change: -1.09, volume: "0.6B" },
  { pair: "MATIC/USDT", price: 0.89, change: 4.33, volume: "0.4B" },
  { pair: "DOT/USDT", price: 7.45, change: -0.56, volume: "0.3B" },
];

export default function MarketList() {
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
        {markets.map((m) => (
          <Link
            key={m.pair}
            href={`/?pair=${toPairParam(m.pair)}`}
            className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-[var(--border-subtle)] px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-tertiary)] [&:active]:bg-[var(--bg-tertiary)]"
          >
            <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
              {m.pair}
            </span>
            <span className="min-w-[72px] whitespace-nowrap font-mono text-sm text-[var(--text-primary)] tabular-nums">
              ${formatPrice(m.price)}
            </span>
            <span
              className={`min-w-[56px] font-mono text-sm font-medium tabular-nums ${
                m.change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
              }`}
            >
              {m.change >= 0 ? "+" : ""}
              {m.change}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
