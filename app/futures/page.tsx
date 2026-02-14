import Header from "../components/Header";
import MarketTicker from "../components/MarketTicker";
import Chart from "../components/Chart";
import OrderBook from "../components/OrderBook";
import OrderPanel from "../components/OrderPanel";
import MarketList from "../components/MarketList";

export default function FuturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header />
      <MarketTicker />
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:flex-row">
        <aside className="hidden w-52 shrink-0 xl:block">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Positions
            </h3>
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                No open positions
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Connect wallet to trade
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MarketList />
          </div>
        </aside>
        <div className="min-h-[400px] min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-[var(--accent-gold)]/20 px-2 py-0.5 text-xs font-medium text-[var(--accent-gold)]">
              Perpetual
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              BTCUSDT • Up to 125x leverage
            </span>
          </div>
          <Chart />
        </div>
        <aside className="flex shrink-0 flex-col gap-4 lg:w-80">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              Leverage
            </h3>
            <div className="flex gap-2">
              {["1x", "5x", "10x", "25x", "50x", "125x"].map((lev) => (
                <button
                  key={lev}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    lev === "10x"
                      ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {lev}
                </button>
              ))}
            </div>
          </div>
          <OrderBook />
          <OrderPanel />
        </aside>
      </main>
    </div>
  );
}
