"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchTickers24h, type Ticker24h } from "@/lib/binance";

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function formatVolume(quoteVolume: string): string {
  const v = parseFloat(quoteVolume);
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
}

function toPairParam(symbol: string) {
  return symbol.replace("/", "-");
}

function formatPair(symbol: string) {
  return symbol.replace("USDT", "/USDT");
}

export default function MarketsTable() {
  const [tickers, setTickers] = useState<Ticker24h[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTickers24h();
      const sorted = [...data].sort(
        (a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)
      );
      setTickers(sorted.slice(0, 20));
    };
    load();
    const id = setInterval(load, 500);
    return () => clearInterval(id);
  }, []);

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
          {tickers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-muted)]">
                Loading…
              </td>
            </tr>
          ) : (
            tickers.map((t) => {
              const pair = formatPair(t.symbol);
              const price = parseFloat(t.lastPrice);
              const change = parseFloat(t.priceChangePercent);
              return (
                <tr
                  key={t.symbol}
                  className="border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-[var(--bg-tertiary)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/?pair=${toPairParam(pair)}`}
                      className="font-mono font-medium text-[var(--accent-cyan)] hover:underline"
                    >
                      {pair}
                    </Link>
                  </td>
                  <td className="min-w-[90px] whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                    ${formatPrice(price)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-medium ${
                      change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
                    {formatVolume(t.quoteVolume)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
