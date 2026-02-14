"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const pairs = [
  { symbol: "BTC/USDT", price: 97432.45, change: 2.34 },
  { symbol: "ETH/USDT", price: 3621.28, change: -0.87 },
  { symbol: "SOL/USDT", price: 218.94, change: 5.12 },
  { symbol: "BNB/USDT", price: 642.11, change: 1.22 },
  { symbol: "XRP/USDT", price: 2.34, change: -2.15 },
  { symbol: "DOGE/USDT", price: 0.42, change: 8.45 },
  { symbol: "AVAX/USDT", price: 38.92, change: 3.67 },
  { symbol: "LINK/USDT", price: 14.21, change: -1.09 },
  { symbol: "MATIC/USDT", price: 0.89, change: 4.33 },
  { symbol: "DOT/USDT", price: 7.45, change: -0.56 },
];

function toPairParam(symbol: string) {
  return symbol.replace("/", "-");
}

export default function MarketTicker() {
  const searchParams = useSearchParams();
  const currentPair = searchParams.get("pair")?.replace("-", "/") ?? "BTC/USDT";

  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2">
      {pairs.map((pair) => {
        const href = `/?pair=${toPairParam(pair.symbol)}`;
        const isActive = currentPair === pair.symbol;

        return (
          <Link
            key={pair.symbol}
            href={href}
            className={`flex shrink-0 items-center gap-3 rounded px-3 py-1.5 transition-colors hover:bg-[var(--bg-tertiary)] ${
              isActive ? "bg-[var(--bg-tertiary)] ring-1 ring-[var(--border)]" : ""
            }`}
          >
          <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
            {pair.symbol}
          </span>
          <span className="font-mono text-sm text-[var(--text-secondary)]">
            ${pair.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span
            className={`font-mono text-xs font-medium ${
              pair.change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
            }`}
          >
            {pair.change >= 0 ? "+" : ""}
            {pair.change}%
          </span>
          </Link>
        );
      })}
    </div>
  );
}
