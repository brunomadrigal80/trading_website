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
  { pair: "ADA/USDT", price: 0.58, change: 1.12, volume: "0.8B" },
  { pair: "ATOM/USDT", price: 9.21, change: -0.34, volume: "0.2B" },
];

export default function MarketsTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] text-left text-sm text-[var(--text-muted)]">
            <th className="px-4 py-3">Pair</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">24h Change</th>
            <th className="px-4 py-3 text-right">24h Volume</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m) => (
            <tr
              key={m.pair}
              className="border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-[var(--bg-tertiary)]"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/?pair=${toPairParam(m.pair)}`}
                  className="font-mono font-medium text-[var(--accent-cyan)] hover:underline"
                >
                  {m.pair}
                </Link>
              </td>
              <td className="min-w-[90px] whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                ${formatPrice(m.price)}
              </td>
              <td
                className={`px-4 py-3 text-right font-mono font-medium ${
                  m.change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
                }`}
              >
                {m.change >= 0 ? "+" : ""}
                {m.change}%
              </td>
              <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
                {m.volume}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
