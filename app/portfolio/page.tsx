import Header from "../components/Header";
import MarketTicker from "../components/MarketTicker";

const balances = [
  { asset: "USDT", total: 12500.0, available: 10234.56 },
  { asset: "BTC", total: 0.1245, available: 0.1245 },
  { asset: "ETH", total: 2.34, available: 2.34 },
];

const openOrders = [
  { pair: "BTC/USDT", side: "Buy", type: "Limit", price: 96000, amount: 0.05, filled: "0%" },
  { pair: "ETH/USDT", side: "Sell", type: "Limit", price: 3700, amount: 1.0, filled: "0%" },
];

const recentTrades = [
  { pair: "BTC/USDT", side: "Buy", price: 97120, amount: 0.02, time: "2 min ago" },
  { pair: "SOL/USDT", side: "Sell", price: 218.5, amount: 5, time: "15 min ago" },
  { pair: "ETH/USDT", side: "Buy", price: 3610, amount: 0.5, time: "1 hr ago" },
];

export default function PortfolioPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header />
      <MarketTicker />
      <main className="flex flex-1 flex-col gap-6 overflow-auto p-4">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Portfolio
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Asset Balances
            </h2>
            <div className="space-y-2">
              {balances.map((b) => (
                <div
                  key={b.asset}
                  className="flex items-center justify-between rounded-lg bg-[var(--bg-tertiary)] px-4 py-3"
                >
                  <span className="font-mono font-medium text-[var(--text-primary)]">
                    {b.asset}
                  </span>
                  <div className="text-right">
                    <div className="font-mono text-[var(--text-primary)]">
                      {b.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Available:{" "}
                      {b.available.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Total Balance
            </h2>
            <div className="text-3xl font-bold text-[var(--accent-cyan)]">
              $24,892.45
            </div>
            <div className="mt-2 text-sm text-[var(--accent-buy)]">+2.34% 24h</div>
          </section>
        </div>

        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            Open Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)]">
                  <th className="pb-2">Pair</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Filled</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((o, i) => (
                  <tr key={i} className="border-t border-[var(--border-subtle)]">
                    <td className="py-3 font-mono text-[var(--text-primary)]">
                      {o.pair}
                    </td>
                    <td
                      className={
                        o.side === "Buy"
                          ? "text-[var(--accent-buy)]"
                          : "text-[var(--accent-sell)]"
                      }
                    >
                      {o.side}
                    </td>
                    <td className="text-[var(--text-secondary)]">{o.type}</td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      {o.price.toLocaleString()}
                    </td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      {o.amount}
                    </td>
                    <td className="text-[var(--text-muted)]">{o.filled}</td>
                    <td>
                      <button className="text-[var(--accent-sell)] hover:underline">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            Recent Trades
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)]">
                  <th className="pb-2">Pair</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((t, i) => (
                  <tr
                    key={i}
                    className="border-t border-[var(--border-subtle)]"
                  >
                    <td className="py-3 font-mono text-[var(--text-primary)]">
                      {t.pair}
                    </td>
                    <td
                      className={
                        t.side === "Buy"
                          ? "text-[var(--accent-buy)]"
                          : "text-[var(--accent-sell)]"
                      }
                    >
                      {t.side}
                    </td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      {t.price.toLocaleString()}
                    </td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      {t.amount}
                    </td>
                    <td className="text-[var(--text-muted)]">{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
