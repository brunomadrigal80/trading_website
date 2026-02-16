export default function LoadingUI() {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-[#0a0b0d]"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="relative flex h-11 w-11 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[#23282f] opacity-40" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0ab3e6]"
          style={{ animation: "initial-load-spin 0.8s linear infinite" }}
        />
        <span className="text-lg font-bold text-[#0ab3e6]">V</span>
      </div>
      <p className="text-sm font-medium text-[#848e9c]">Loading Vertex</p>
    </div>
  );
}
