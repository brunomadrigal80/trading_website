"use client";

import Header from "../components/Header";
import { useTickers } from "@/context/TickerContext";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useBalance } from "wagmi";

const WATCHLIST_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function PortfolioPage() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const { data: balanceData } = useBalance({ address: address as `0x${string}` | undefined });
  const { getTickersBySymbols } = useTickers();
  const tickers = getTickersBySymbols(WATCHLIST_SYMBOLS);
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header />
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
              Balance
            </h2>
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  Connect your wallet to see your balance
                </p>
                <button
                  type="button"
                  onClick={() => open()}
                  className="mt-4 rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
                >
                  Connect Wallet
                </button>
              </div>
            ) : balanceData ? (
              <>
                <div className="text-3xl font-bold text-[var(--text-primary)]">
                  {balanceData.formatted} {balanceData.symbol}
                </div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
                </div>
              </>
            ) : (
              <div className="text-sm text-[var(--text-muted)]">Loading…</div>
            )}
          </section>
        </div>

        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            Open Orders
          </h2>
          <div className="rounded-lg bg-[var(--bg-tertiary)] px-4 py-8 text-center">
            {isConnected ? (
              <p className="text-sm text-[var(--text-muted)]">
                Connect exchange API keys to view your open orders.
              </p>
            ) : (
              <>
                <p className="text-sm text-[var(--text-muted)]">
                  Connect your wallet to manage orders
                </p>
                <button
                  type="button"
                  onClick={() => open()}
                  className="mt-4 rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
                >
                  Connect Wallet
                </button>
              </>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            Recent Trades
          </h2>
          <div className="rounded-lg bg-[var(--bg-tertiary)] px-4 py-8 text-center">
            {isConnected ? (
              <p className="text-sm text-[var(--text-muted)]">
                Connect exchange API keys to view your trade history.
              </p>
            ) : (
              <>
                <p className="text-sm text-[var(--text-muted)]">
                  Connect your wallet to see recent trades
                </p>
                <button
                  type="button"
                  onClick={() => open()}
                  className="mt-4 rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
                >
                  Connect Wallet
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
