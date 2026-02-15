"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function FuturesPositions() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  return (
    <div className="shrink-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
        Positions
      </h3>
      <div className="rounded-lg bg-[var(--bg-tertiary)] p-4 text-center">
        {isConnected ? (
          <>
            <p className="text-sm text-[var(--text-muted)]">
              No open positions
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Place orders to open futures positions
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--text-muted)]">
              Connect wallet to trade
            </p>
            <button
              type="button"
              onClick={() => open()}
              className="mt-3 rounded-lg bg-[var(--accent-cyan)] px-3 py-1.5 text-xs font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
            >
              Connect Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}