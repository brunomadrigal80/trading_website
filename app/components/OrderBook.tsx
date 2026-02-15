"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { fetchOrderBook, fetchFuturesOrderBook } from "@/lib/binance";

function getBaseAsset(pair: string) {
  return pair.split("/")[0] ?? "BTC";
}

const STEPS = ["0.00001", "0.0001", "0.001", "0.01", "0.1", "1", "10"] as const;

function roundToStep(price: number, step: number): number {
  if (step < 0.0001) return Math.round(price * 100000) / 100000;
  return Math.round(price / step) * step;
}

function formatAmount(amount: number): string {
  if (amount >= 1000) return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (amount >= 1) return amount.toFixed(2);
  if (amount >= 0.01) return amount.toFixed(4);
  return amount.toFixed(6);
}

function dispatchPriceSelect(price: number, side: "buy" | "sell") {
  window.dispatchEvent(new CustomEvent("orderbook:setPrice", { detail: { price, side } }));
}

export default function OrderBook() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pair = searchParams.get("pair")?.replace("-", "/") ?? "BTC/USDT";
  const useFutures = pathname?.includes("/futures") ?? false;
  const baseAsset = getBaseAsset(pair);
  const [step, setStep] = useState<(typeof STEPS)[number]>("0.1");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bids, setBids] = useState<{ price: number; amount: number }[]>([]);
  const [asks, setAsks] = useState<{ price: number; amount: number }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const load = async () => {
      const data = useFutures ? await fetchFuturesOrderBook(pair, 50) : await fetchOrderBook(pair, 50);
      if (data) {
        setBids(
          data.bids.map(([p, q]) => ({ price: parseFloat(p), amount: parseFloat(q) }))
        );
        setAsks(
          data.asks.map(([p, q]) => ({ price: parseFloat(p), amount: parseFloat(q) }))
        );
      }
    };
    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [pair, useFutures]);

  const stepNum = parseFloat(step);

  const groupByStep = (
    levels: { price: number; amount: number }[]
  ): { price: number; amount: number }[] => {
    const grouped = new Map<number, number>();
    for (const { price, amount } of levels) {
      const rounded = roundToStep(price, stepNum);
      grouped.set(rounded, (grouped.get(rounded) ?? 0) + amount);
    }
    return [...grouped.entries()]
      .map(([price, amount]) => ({ price, amount }))
      .sort((a, b) => a.price - b.price);
  };

  const groupedBids = groupByStep(bids).reverse();
  const groupedAsks = groupByStep(asks);
  const bestBid = groupedBids[0]?.price;
  const bestAsk = groupedAsks[0]?.price;
  const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
  const displayMaxBid = Math.max(...groupedBids.map((b) => b.amount), 1);
  const displayMaxAsk = Math.max(...groupedAsks.map((a) => a.amount), 1);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Order Book</h3>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-cyan)] hover:bg-[var(--bg-elevated)]"
          >
            {step}
            <svg
              className={`h-3 w-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-[100%] rounded border border-[var(--border)] bg-[var(--bg-elevated)] py-1 shadow-lg">
              {STEPS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStep(s);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-[var(--bg-tertiary)] ${
                    step === s ? "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]" : "text-[var(--text-primary)]"
                  }`}
                >
                  {s}
                  {step === s && (
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col text-xs">
        <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-[var(--border-subtle)] px-4 py-2 text-[var(--text-muted)]">
          <span>Price(USDT)</span>
          <span className="text-right">Amount({baseAsset})</span>
          <span className="text-right">Total</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {groupedBids.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--text-muted)]">Loading…</div>
          ) : (
            groupedBids.map(({ price, amount }) => (
              <button
                key={`${price}-${amount}`}
                type="button"
                onClick={() => dispatchPriceSelect(price, "buy")}
                className="relative grid w-full grid-cols-3 gap-2 px-4 py-1 text-left font-mono transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-[var(--accent-buy)]/10"
                  style={{ width: `${(amount / displayMaxBid) * 100}%` }}
                />
                <span className="relative text-[var(--accent-buy)]">
                  {price >= 1
                    ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : price.toFixed(6)}
                </span>
                <span className="relative text-right text-[var(--text-secondary)]">{formatAmount(amount)}</span>
                <span className="relative text-right text-[var(--text-muted)]">
                  {(price * amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="shrink-0 border-y border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-center font-mono font-semibold text-[var(--text-primary)]">
          ${midPrice >= 1 ? midPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : midPrice.toFixed(6)}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {groupedAsks.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--text-muted)]">Loading…</div>
          ) : (
            groupedAsks.map(({ price, amount }) => (
              <button
                key={`${price}-${amount}`}
                type="button"
                onClick={() => dispatchPriceSelect(price, "sell")}
                className="relative grid w-full grid-cols-3 gap-2 px-4 py-1 text-left font-mono transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-[var(--accent-sell)]/10"
                  style={{ width: `${(amount / displayMaxAsk) * 100}%` }}
                />
                <span className="relative text-[var(--accent-sell)]">
                  {price >= 1
                    ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : price.toFixed(6)}
                </span>
                <span className="relative text-right text-[var(--text-secondary)]">{formatAmount(amount)}</span>
                <span className="relative text-right text-[var(--text-muted)]">
                  {(price * amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
