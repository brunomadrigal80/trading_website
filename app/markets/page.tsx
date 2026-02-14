import Header from "../components/Header";
import MarketTicker from "../components/MarketTicker";
import MarketsTable from "../components/MarketsTable";

export default function MarketsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header />
      <MarketTicker />
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-4 text-2xl font-semibold text-[var(--text-primary)]">
            Markets
          </h1>
          <MarketsTable />
        </div>
      </main>
    </div>
  );
}
