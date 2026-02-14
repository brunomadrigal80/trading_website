"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  CandlestickData,
  UTCTimestamp,
} from "lightweight-charts";

function generateCandles(): CandlestickData[] {
  const candles: CandlestickData[] = [];
  let price = 95000;
  const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
  const interval = 60;

  for (let i = 200; i >= 0; i--) {
    const time = (now - i * interval) as UTCTimestamp;
    const change = (Math.random() - 0.48) * 400;
    const open = price;
    price = Math.max(90000, Math.min(100000, price + change));
    const close = price;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;

    candles.push({
      time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
  }

  return candles;
}

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#848e9c",
        fontFamily: "var(--font-jetbrains), monospace",
      },
      grid: {
        vertLines: { color: "#1e2329" },
        horzLines: { color: "#1e2329" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#2b3139",
          width: 1,
          labelBackgroundColor: "#0ab3e6",
        },
        horzLine: {
          color: "#2b3139",
          width: 1,
          labelBackgroundColor: "#0ab3e6",
        },
      },
      rightPriceScale: {
        borderColor: "#2b3139",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "#2b3139",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#0ecb81",
      downColor: "#f6465d",
      borderDownColor: "#f6465d",
      borderUpColor: "#0ecb81",
      wickDownColor: "#f6465d",
      wickUpColor: "#0ecb81",
    });

    candlestickSeries.setData(generateCandles());

    chart.timeScale().fitContent();

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="flex flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-lg font-semibold text-[var(--text-primary)]">
            BTC/USDT
          </h2>
          <span className="font-mono text-[var(--accent-buy)]">$97,432.45</span>
          <span className="text-sm text-[var(--accent-buy)]">+2.34%</span>
          <span className="text-xs text-[var(--text-muted)]">24h</span>
        </div>
        <div className="flex gap-1">
          {["1m", "5m", "15m", "1H", "4H", "1D", "1W"].map((tf) => (
            <button
              key={tf}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                tf === "1H"
                  ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="h-[480px] w-full" />
    </div>
  );
}
