import Header from "../components/Header";
import Chart from "../components/Chart";
import OrderBook from "../components/OrderBook";
import OrderPanel from "../components/OrderPanel";
import MarketList from "../components/MarketList";
import FuturesLeverageSelector from "../components/FuturesLeverageSelector";
import FuturesPositions from "../components/FuturesPositions";

export default function FuturesPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-primary)]">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        <aside className="hidden min-h-0 w-60 shrink-0 flex-col xl:flex">
          <FuturesPositions />
          <div className="mt-4 min-h-0 flex-1">
            <OrderBook />
          </div>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <span className="rounded bg-[var(--accent-gold)]/20 px-2 py-0.5 text-xs font-medium text-[var(--accent-gold)]">
              Perpetual
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              Up to 125x leverage • Select pair from Markets
            </span>
          </div>
          <Chart />
        </div>
        <aside className="flex min-h-0 shrink-0 flex-col gap-4 overflow-hidden lg:w-96">
          <FuturesLeverageSelector />
          <MarketList />
          <OrderPanel />
        </aside>
      </main>
    </div>
  );
}
