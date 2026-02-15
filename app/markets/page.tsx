import Header from "../components/Header";
import MarketsTable from "../components/MarketsTable";

export default function MarketsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Header />
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-4 text-2xl font-semibold text-[var(--text-primary)]">
            Spot Markets
          </h1>
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            Click a pair to open the spot trading view
          </p>
          <MarketsTable />
        </div>
      </main>
    </div>
  );
}
