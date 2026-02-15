"use client";

import { useState } from "react";

const LEVERAGE_OPTIONS = ["1x", "5x", "10x", "25x", "50x", "125x"] as const;

export default function FuturesLeverageSelector() {
  const [leverage, setLeverage] = useState<(typeof LEVERAGE_OPTIONS)[number]>("10x");

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        Leverage
      </h3>
      <div className="flex flex-wrap gap-2">
        {LEVERAGE_OPTIONS.map((lev) => (
          <button
            key={lev}
            type="button"
            onClick={() => setLeverage(lev)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              leverage === lev
                ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {lev}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        Current: {leverage} leverage
      </p>
    </div>
  );
}
