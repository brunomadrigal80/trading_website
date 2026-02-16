export default function Loading() {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#0a0b0d]"
      style={{ background: "var(--bg-primary, #0a0b0d)" }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-[var(--border-subtle)] opacity-30"
          aria-hidden
        />
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent-cyan)]"
          aria-hidden
          style={{
            animationDuration: "0.8s",
          }}
        />
        <span className="text-lg font-bold text-[var(--accent-cyan)] opacity-90">
          V
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Loading Vertex
        </p>
        <div className="flex gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse"
            style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse opacity-70"
            style={{ animationDelay: "150ms", animationDuration: "1.2s" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse opacity-50"
            style={{ animationDelay: "300ms", animationDuration: "1.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
