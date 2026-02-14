"use client";

const markets = [
  { pair: "BTC/USDT", price: 97432.45, change: 2.34, volume: "28.2B" },
  { pair: "ETH/USDT", price: 3621.28, change: -0.87, volume: "12.1B" },
  { pair: "SOL/USDT", price: 218.94, change: 5.12, volume: "3.4B" },
  { pair: "BNB/USDT", price: 642.11, change: 1.22, volume: "1.2B" },
  { pair: "XRP/USDT", price: 2.34, change: -2.15, volume: "2.8B" },
  { pair: "DOGE/USDT", price: 0.42, change: 8.45, volume: "1.9B" },
  { pair: "AVAX/USDT", price: 38.92, change: 3.67, volume: "0.5B" },
  { pair: "LINK/USDT", price: 14.21, change: -1.09, volume: "0.6B" },
  { pair: "MATIC/USDT", price: 0.89, change: 4.33, volume: "0.4B" },
  { pair: "DOT/USDT", price: 7.45, change: -0.56, volume: "0.3B" },
];

export default function MarketList() {
  return (
    <div className="flex flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Markets
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-1 px-2 py-2 text-[10px] text-[var(--text-muted)]">
        <span>Pair</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h%</span>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        {markets.map((m) => (
          <button
            key={m.pair}
            className="grid w-full grid-cols-3 items-center gap-2 border-t border-[var(--border-subtle)] px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-tertiary)]"
          >
            <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
              {m.pair}
            </span>
            <span className="font-mono text-sm text-[var(--text-secondary)]">
              ${m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`font-mono text-sm font-medium ${
                m.change >= 0 ? "text-[var(--accent-buy)]" : "text-[var(--accent-sell)]"
              }`}
            >
              {m.change >= 0 ? "+" : ""}
              {m.change}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
