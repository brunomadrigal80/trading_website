"use client";

import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 700;
const FADE_OUT_MS = 350;

type Phase = "visible" | "fading" | "removed";

export default function InitialLoadOverlay() {
  const [phase, setPhase] = useState<Phase>("visible");

  useEffect(() => {
    const startFade = setTimeout(() => setPhase("fading"), MIN_DISPLAY_MS);
    return () => clearTimeout(startFade);
  }, []);

  useEffect(() => {
    if (phase !== "fading") return;
    const remove = setTimeout(() => setPhase("removed"), FADE_OUT_MS);
    return () => clearTimeout(remove);
  }, [phase]);

  if (phase === "removed") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[#0a0b0d] transition-opacity duration-[350ms] ease-out"
      style={{
        opacity: phase === "visible" ? 1 : 0,
        pointerEvents: phase === "visible" ? "auto" : "none",
      }}
      aria-busy={phase === "visible"}
      aria-label="Loading"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-[#23282f] opacity-40"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0ab3e6]"
          style={{
            animation: "initial-load-spin 0.85s linear infinite",
          }}
          aria-hidden
        />
        <span className="text-xl font-bold text-[#0ab3e6]">V</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-[#848e9c]">Loading Vertex</p>
        <div className="flex gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-[#0ab3e6]"
            style={{ animation: "initial-load-pulse 1.2s ease-in-out infinite" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-[#0ab3e6]"
            style={{
              animation: "initial-load-pulse 1.2s ease-in-out 0.15s infinite",
            }}
          />
          <span
            className="h-2 w-2 rounded-full bg-[#0ab3e6]"
            style={{
              animation: "initial-load-pulse 1.2s ease-in-out 0.3s infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
