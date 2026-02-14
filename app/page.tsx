import Header from "./components/Header";
import MarketTicker from "./components/MarketTicker";
import Chart from "./components/Chart";
import OrderBook from "./components/OrderBook";
import OrderPanel from "./components/OrderPanel";
import MarketList from "./components/MarketList";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header />
      <MarketTicker />
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:flex-row">
        <aside className="hidden w-52 shrink-0 xl:block">
          <MarketList />
        </aside>
        <div className="min-h-[400px] min-w-0 flex-1">
          <Chart />
        </div>
        <aside className="flex shrink-0 flex-col gap-4 lg:w-80">
          <OrderBook />
          <OrderPanel />
        </aside>
      </main>
    </div>
  );
}
