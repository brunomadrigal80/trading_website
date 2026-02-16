"use client";

import dynamic from "next/dynamic";
import Header from "./Header";
import MarketTicker from "./MarketTicker";
import OrderPanel from "./OrderPanel";
import MarketList from "./MarketList";

const Chart = dynamic(() => import("./Chart"), {
  loading: () => (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent-cyan)]" />
    </div>
  ),
  ssr: false,
});

const OrderBook = dynamic(() => import("./OrderBook"), {
  loading: () => (
    <div className="flex min-h-0 w-60 flex-1 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent-cyan)]" />
    </div>
  ),
  ssr: false,
});

export default function HomeContent() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-primary)]">
      <Header />
      <MarketTicker />
      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        <aside className="hidden min-h-0 w-60 shrink-0 xl:flex xl:flex-col">
          <OrderBook />
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Chart />
        </div>
        <aside className="flex min-h-0 shrink-0 flex-col gap-4 overflow-hidden lg:w-96">
          <MarketList />
          <OrderPanel />
        </aside>
      </main>
    </div>
  );
}
