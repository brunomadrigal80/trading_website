"use client";

import Header from "../components/Header";
import MarketTicker from "../components/MarketTicker";
import { useEffect, useState } from "react";
import { fetchTickers24h, type Ticker24h } from "@/lib/binance";

const WATCHLIST_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "USDT"];

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function PortfolioPage() {
  const [tickers, setTickers] = useState<Ticker24h[]>([]);

  useEffect(() => {
    const load = async () => {
      const symbols = WATCHLIST_SYMBOLS.filter((s) => s !== "USDT").map((s) => `${s}USDT`);
      const data = await fetchTickers24h(symbols);
      setTickers(data);
    };
    load();
    const id = setInterval(load, 500);
    return () => clearInterval(id);
  }, []);

  const btcTicker = tickers.find((t) => t.symbol === "BTCUSDT");
  const btcPrice = btcTicker ? parseFloat(btcTicker.lastPrice) : 0;
  const btcChange = btcTicker ? parseFloat(btcTicker.priceChangePercent) : 0;
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header />
      <MarketTicker />
      <main className="flex flex-1 flex-col gap-6 overflow-auto p-4">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Portfolio
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Market Overview
            </h2>
            <div className="space-y-2">
              {tickers.length === 0 ? (
                <div className="rounded-lg bg-[var(--bg-tertiary)] px-4 py-6 text-center text-[var(--text-muted)]">
                  Loading…
                </div>
              ) : (
                tickers.map((t) => {
                  const pair = t.symbol.replace("USDT", "/USDT");
                  const price = parseFloat(t.lastPrice);
                  const change = parseFloat(t.priceChangePercent);
                  return (
                    <div
                      key={t.symbol}
                      className="flex items-center justify-between rounded-lg bg-[var(--bg-tertiary)] px-4 py-3"
                    >
                      <span className="font-mono font-medium text-[var(--text-primary)]">
                        {pair}
                      </span>
                      <div className="text-right">
                        <div className="font-mono text-[var(--text-primary)]">
                          ${formatPrice(price)}
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
                          }`}
                        >
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(2)}% 24h
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              BTC Price
            </h2>
            <div className={`text-3xl font-bold ${btcChange >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"}`}>
              {btcPrice > 0 ? `$${formatPrice(btcPrice)}` : "—"}
            </div>
            <div className={`mt-2 text-sm ${btcChange >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"}`}>
              {!isNaN(btcChange) ? `${btcChange >= 0 ? "+" : ""}${btcChange.toFixed(2)}% 24h` : "—"}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            Open Orders
          </h2>
          <div className="rounded-lg bg-[var(--bg-tertiary)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            Connect Binance API keys to view your open orders.
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            Recent Trades
          </h2>
          <div className="rounded-lg bg-[var(--bg-tertiary)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            Connect Binance API keys to view your trade history.
          </div>
        </section>
      </main>
    </div>
  );
}
