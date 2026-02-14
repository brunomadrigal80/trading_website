"use client";

import { useState } from "react";

export default function OrderPanel() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState("Limit");

  return (
    <div className="flex flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            side === "buy"
              ? "bg-[var(--accent-buy)]/20 text-[var(--accent-buy)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            side === "sell"
              ? "bg-[var(--accent-sell)]/20 text-[var(--accent-sell)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Sell
        </button>
      </div>
      <div className="border-b border-[var(--border-subtle)] p-4">
        <div className="mb-3 flex gap-2">
          {["Limit", "Market"].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                orderType === type
                  ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {orderType === "Limit" && (
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">
                Price (USDT)
              </label>
              <input
                type="text"
                placeholder="0.00"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2.5 font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
              Amount (BTC)
            </label>
            <input
              type="text"
              placeholder="0.00"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2.5 font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["25%", "50%", "75%", "100%"].map((pct) => (
              <button
                key={pct}
                className="flex-1 rounded py-1.5 text-xs font-medium text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10"
              >
                {pct}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex justify-between text-xs text-[var(--text-muted)]">
          <span>Total</span>
          <span className="font-mono text-[var(--text-secondary)]">0.00 USDT</span>
        </div>
        <button
          className={`w-full rounded-lg py-3 font-semibold transition-opacity hover:opacity-90 ${
            side === "buy"
              ? "bg-[var(--accent-buy)] text-[var(--bg-primary)]"
              : "bg-[var(--accent-sell)] text-white"
          }`}
        >
          {side === "buy" ? "Buy BTC" : "Sell BTC"}
        </button>
      </div>
    </div>
  );
}
