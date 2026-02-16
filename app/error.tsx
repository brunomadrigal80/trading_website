"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isWalletError =
    /failed to connect|metamask|connection declined|connector/i.test(
      error.message
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] p-4">
      <div className="max-w-md rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 text-center">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {isWalletError ? "Wallet connection issue" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {isWalletError
            ? "MetaMask connection failed. Unlock MetaMask, refresh the page, and try connecting again."
            : error.message}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
