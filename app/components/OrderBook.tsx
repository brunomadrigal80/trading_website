"use client";

import { useSearchParams } from "next/navigation";

const bids = [
  { price: 97430.5, amount: 0.245 },
  { price: 97428.2, amount: 1.12 },
  { price: 97425.0, amount: 0.89 },
  { price: 97420.1, amount: 2.34 },
  { price: 97415.8, amount: 0.56 },
  { price: 97410.0, amount: 3.21 },
  { price: 97405.2, amount: 0.78 },
  { price: 97400.0, amount: 1.45 },
].reverse();

const asks = [
  { price: 97431.2, amount: 0.12 },
  { price: 97433.5, amount: 0.89 },
  { price: 97435.0, amount: 2.11 },
  { price: 97440.1, amount: 0.34 },
  { price: 97445.8, amount: 1.56 },
  { price: 97450.0, amount: 0.67 },
  { price: 97455.2, amount: 2.89 },
  { price: 97460.0, amount: 0.45 },
];

const maxBidAmount = Math.max(...bids.map((b) => b.amount));
const maxAskAmount = Math.max(...asks.map((a) => a.amount));

function getBaseAsset(pair: string) {
  return pair.split("/")[0] ?? "BTC";
}

export default function OrderBook() {
  const searchParams = useSearchParams();
  const pair = searchParams.get("pair")?.replace("-", "/") ?? "BTC/USDT";
  const baseAsset = getBaseAsset(pair);

  return (
    <div className="flex flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Order Book
        </h3>
        <div className="flex gap-2">
          {["0.01", "0.1", "1", "10"].map((step) => (
            <button
              key={step}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                step === "0.1"
                  ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs">
        <div className="grid grid-cols-3 gap-2 border-b border-[var(--border-subtle)] px-4 py-2 text-[var(--text-muted)]">
          <span>Price(USDT)</span>
          <span className="text-right">Amount({baseAsset})</span>
          <span className="text-right">Total</span>
        </div>
        <div className="max-h-[220px] overflow-y-auto">
          {bids.map(({ price, amount }) => (
            <div
              key={price}
              className="relative grid grid-cols-3 gap-2 px-4 py-1 font-mono hover:bg-[var(--bg-tertiary)]"
            >
              <div
                className="absolute inset-y-0 right-0 bg-[var(--accent-buy)]/10"
                style={{
                  width: `${(amount / maxBidAmount) * 100}%`,
                }}
              />
              <span className="relative text-[var(--accent-buy)]">{price.toLocaleString()}</span>
              <span className="relative text-right text-[var(--text-secondary)]">
                {amount.toFixed(3)}
              </span>
              <span className="relative text-right text-[var(--text-muted)]">
                {(price * amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
        <div className="border-y border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-center font-mono font-semibold text-[var(--text-primary)]">
          $97,430.85
        </div>
        <div className="max-h-[220px] overflow-y-auto">
          {asks.map(({ price, amount }) => (
            <div
              key={price}
              className="relative grid grid-cols-3 gap-2 px-4 py-1 font-mono hover:bg-[var(--bg-tertiary)]"
            >
              <div
                className="absolute inset-y-0 right-0 bg-[var(--accent-sell)]/10"
                style={{
                  width: `${(amount / maxAskAmount) * 100}%`,
                }}
              />
              <span className="relative text-[var(--accent-sell)]">{price.toLocaleString()}</span>
              <span className="relative text-right text-[var(--text-secondary)]">
                {amount.toFixed(3)}
              </span>
              <span className="relative text-right text-[var(--text-muted)]">
                {(price * amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
