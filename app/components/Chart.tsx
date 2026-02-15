"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createChart,
  CandlestickSeries,
  CandlestickData,
  UTCTimestamp,
  TickMarkType,
  Time,
  isBusinessDay,
  isUTCTimestamp,
} from "lightweight-charts";
import { fetchKlines, fetchFuturesKlines, type Kline } from "@/lib/binance";
import { useTickers } from "@/context/TickerContext";

function klinesToCandles(klines: Kline[]): CandlestickData[] {
  return klines.map((k) => ({
    time: Math.floor(k[0] / 1000) as UTCTimestamp,
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  }));
}

const TIMEFRAMES = ["1s", "15m", "1H", "4H", "1D", "1W"] as const;

/**
 * Time axis label format by timeframe:
 * | 1m   | HH:MM:SS          | 05:59, 06:00, 06:01
 * | 5m   | HH:MM             | 06:00, 06:05, 06:10
 * | 15m  | HH:MM             | 06:00, 06:15, 06:30
 * | 1H   | HH:00             | 16:00, 17:00, 18:00
 * | 4H   | HH:00             | 00:00, 04:00, 08:00
 * | 1D   | day number        | 21, 22, 23, 24
 * | 1W   | Nth week of Month | 1st week of Feb, 2nd week of Feb
 */
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function getWeekOfMonth(date: Date): number {
  const day = date.getUTCDate();
  return Math.ceil(day / 7);
}

function createTickMarkFormatter(timeframe: string) {
  return (time: Time, tickMarkType: TickMarkType, _locale: string): string | null => {
    let date: Date;
    if (isUTCTimestamp(time)) {
      date = new Date((time as number) * 1000);
    } else if (isBusinessDay(time)) {
      const b = time as { year: number; month: number; day: number };
      date = new Date(Date.UTC(b.year, b.month - 1, b.day));
    } else {
      return null;
    }

    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const s = date.getUTCSeconds();
    const day = date.getUTCDate();
    const month = date.getUTCMonth();

    const pad = (n: number) => n.toString().padStart(2, "0");

    switch (timeframe) {
      case "1s":
      case "1m":
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
      case "5m":
      case "15m":
        return `${pad(h)}:${pad(m)}`;
      case "1H":
        return `${pad(h)}:00`;
      case "4H":
        return `${pad(h)}:00`;
      case "1D":
        if (tickMarkType === TickMarkType.DayOfMonth || tickMarkType === TickMarkType.Time) {
          return day.toString();
        }
        if (tickMarkType === TickMarkType.Month) return MONTH_NAMES[month];
        return day.toString();
      case "1W":
        if (tickMarkType === TickMarkType.Year) return date.getUTCFullYear().toString();
        if (tickMarkType === TickMarkType.Month) return MONTH_NAMES[month];
        const weekNum = getWeekOfMonth(date);
        return `${getOrdinal(weekNum)} week of ${MONTH_NAMES[month]}`;
      default:
        return null;
    }
  };
}

export default function Chart() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pair = searchParams.get("pair")?.replace("-", "/") ?? "BTC/USDT";
  const useFutures = pathname?.includes("/futures") ?? false;
  const { getTicker } = useTickers();
  const tickerData = getTicker(pair);
  const ticker = useMemo(
    () => (tickerData ? { price: tickerData.lastPrice, change: tickerData.priceChangePercent } : null),
    [tickerData]
  );
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("1s");
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const klinePollMs = timeframe === "1s" ? 3000 : 10000;

  useEffect(() => {
    const load = async () => {
      const data = useFutures
        ? await fetchFuturesKlines(pair, timeframe, timeframe === "1W" ? 100 : 200)
        : await fetchKlines(pair, timeframe, timeframe === "1W" ? 100 : 200);
      if (data.length > 0) setCandles(klinesToCandles(data));
    };
    load();
    const id = setInterval(load, klinePollMs);
    return () => clearInterval(id);
  }, [pair, timeframe, useFutures, klinePollMs]);

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
        secondsVisible: timeframe === "1s",
        tickMarkFormatter: createTickMarkFormatter(timeframe),
        barSpacing: timeframe === "1s" ? 40 : 6,
        minBarSpacing: timeframe === "1s" ? 3 : 0.5,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
        axisDoubleClickReset: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
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

    candlestickSeries.setData(candles);
    chart.timeScale().fitContent();

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [timeframe, candles]);


  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-lg font-semibold text-[var(--text-primary)]">
            {pair}
          </h2>
          <span className={`font-mono ${ticker && !Number.isNaN(parseFloat(ticker.change)) && parseFloat(ticker.change) < 0 ? "text-[var(--accent-sell)]" : "text-[var(--accent-buy)]"}`}>
            {ticker
              ? (() => {
                  const p = parseFloat(ticker.price);
                  return Number.isNaN(p) ? "—" : p >= 1 ? `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(6)}`;
                })()
              : "—"}
          </span>
          <span className={`text-sm ${ticker && !Number.isNaN(parseFloat(ticker.change)) && parseFloat(ticker.change) < 0 ? "text-[var(--accent-sell)]" : "text-[var(--accent-buy)]"}`}>
            {ticker ? (() => { const c = parseFloat(ticker.change); return Number.isNaN(c) ? "—" : `${c >= 0 ? "+" : ""}${c.toFixed(2)}%`; })() : "—"}
          </span>
          <span className="text-xs text-[var(--text-muted)]">24h</span>
        </div>
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                timeframe === tf
                  ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="min-h-0 flex-1 w-full" />
    </div>
  );
}
