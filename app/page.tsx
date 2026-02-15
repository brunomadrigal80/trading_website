import Header from "./components/Header";
import MarketTicker from "./components/MarketTicker";
import Chart from "./components/Chart";
import OrderBook from "./components/OrderBook";
import OrderPanel from "./components/OrderPanel";
import MarketList from "./components/MarketList";

export default function Home() {
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
