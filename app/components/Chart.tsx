"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnimatedValue } from "@/app/hooks/useAnimatedValue";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  CandlestickData,
  UTCTimestamp,
  TickMarkType,
  Time,
  isBusinessDay,
  isUTCTimestamp,
} from "lightweight-charts";
import { fetchKlines, fetchFuturesKlines, fetchTicker24h, fetchFuturesTicker24h, type Kline } from "@/lib/binance";
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

function candlesToLineData(candles: CandlestickData[]) {
  return candles.map((c) => ({ time: c.time, value: c.close }));
}

const CHART_TYPES = [
  { id: "candles" as const, label: "Candles" },
  { id: "line" as const, label: "Line" },
  { id: "bars" as const, label: "Bars" },
  { id: "area" as const, label: "Area" },
] as const;

function ChartTypeIcon({ type }: { type: (typeof CHART_TYPES)[number]["id"] }) {
  const className = "h-4 w-4 text-[var(--text-secondary)]";
  if (type === "candles")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 4v16M8 8h4l-2 8h4M16 8v12M16 12h4l-2 8h4" />
      </svg>
    );
  if (type === "line")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 18l4-6 4 2 8-10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (type === "bars")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 16v-8M10 16V8M14 16v-4M18 16V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 18l4-6 4 2 8-10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18l4-6 4 2 8-10L20 18H4z" fill="currentColor" fillOpacity="0.15" stroke="none" />
    </svg>
  );
}

const TIMEFRAMES = ["0.25s", "1s", "15m", "1H", "4H", "1D", "1W"] as const;

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
      case "0.25s":
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
  const targetPrice = ticker ? parseFloat(ticker.price) : NaN;
  const targetChange = ticker ? parseFloat(ticker.change) : NaN;
  const animatedPrice = useAnimatedValue(Number.isFinite(targetPrice) ? targetPrice : 0, {
    enabled: Number.isFinite(targetPrice),
    durationMs: 360,
  });
  const animatedChange = useAnimatedValue(Number.isFinite(targetChange) ? targetChange : 0, {
    enabled: Number.isFinite(targetChange),
    durationMs: 320,
  });
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("0.25s");
  const [chartType, setChartType] = useState<(typeof CHART_TYPES)[number]["id"]>("candles");
  const [chartTypeOpen, setChartTypeOpen] = useState(false);
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartTypeRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<{ setData: (d: unknown[]) => void; update: (d: unknown) => void } | null>(null);
  const prevCandlesRef = useRef<CandlestickData[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chartTypeRef.current && !chartTypeRef.current.contains(event.target as Node)) {
        setChartTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const klinePollMs = 250;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = useFutures
        ? await fetchFuturesKlines(pair, timeframe, timeframe === "1W" ? 100 : 200)
        : await fetchKlines(pair, timeframe, timeframe === "1W" ? 100 : 200);
      if (mounted && data.length > 0) setCandles(klinesToCandles(data));
    };
    load();
    const id = setInterval(load, klinePollMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [pair, timeframe, useFutures, klinePollMs]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const prevChart = chartRef.current;
    chartRef.current = null;
    seriesRef.current = null;
    if (prevChart) {
      requestAnimationFrame(() => {
        try {
          prevChart.remove();
        } catch {
          // Chart may already be disposed
        }
      });
    }

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
        secondsVisible: timeframe === "0.25s" || timeframe === "1s",
        tickMarkFormatter: createTickMarkFormatter(timeframe),
        barSpacing: timeframe === "0.25s" || timeframe === "1s" ? 40 : 6,
        minBarSpacing: timeframe === "0.25s" || timeframe === "1s" ? 2 : 0.5,
        rightOffset: 12,
        fixRightEdge: true,
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
    chartRef.current = chart;

    const seriesOptions = {
      candlestick: {
        upColor: "#0ecb81",
        downColor: "#f6465d",
        borderDownColor: "#f6465d",
        borderUpColor: "#0ecb81",
        wickDownColor: "#f6465d",
        wickUpColor: "#0ecb81",
      },
      line: { color: "#0ab3e6", lineWidth: 2 as const },
      area: { lineColor: "#0ab3e6", topColor: "rgba(10, 179, 230, 0.4)", bottomColor: "rgba(10, 179, 230, 0)" },
      bars: {
        upColor: "#0ecb81",
        downColor: "#f6465d",
      },
    };

    let series;
    if (chartType === "candles") {
      series = chart.addSeries(CandlestickSeries, seriesOptions.candlestick);
    } else if (chartType === "line") {
      series = chart.addSeries(LineSeries, seriesOptions.line);
    } else if (chartType === "area") {
      series = chart.addSeries(AreaSeries, seriesOptions.area);
    } else {
      series = chart.addSeries(BarSeries, seriesOptions.bars);
    }
    seriesRef.current = series as { setData: (d: unknown[]) => void; update: (d: unknown) => void };
    prevCandlesRef.current = [];

    const handleResize = () => {
      if (chartRef.current !== chart) return;
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      const ch = chart;
      chartRef.current = null;
      seriesRef.current = null;
      requestAnimationFrame(() => {
        try {
          ch.remove();
        } catch {
          // Chart may already be disposed
        }
      });
    };
  }, [timeframe, chartType]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series || candles.length === 0) return;

    try {
    const prev = prevCandlesRef.current;
    const data = chartType === "candles" || chartType === "bars" ? candles : candlesToLineData(candles);

    if (prev.length === 0) {
      series.setData(data);
      prevCandlesRef.current = [...candles];
      chartRef.current?.timeScale().fitContent();
      chartRef.current?.timeScale().scrollToRealTime();
      return;
    }

    const lastPrev = prev[prev.length - 1];
    const lastNew = candles[candles.length - 1];
    const prevTime = (lastPrev as { time: UTCTimestamp }).time;
    const newTime = (lastNew as { time: UTCTimestamp }).time;

    if (prevTime === newTime) {
      const bar =
        chartType === "candles" || chartType === "bars"
          ? lastNew
          : { time: lastNew.time, value: lastNew.close };
      series.update(bar as never);
    } else if (candles.length > prev.length) {
      for (let i = prev.length; i < candles.length; i++) {
        const bar = chartType === "candles" || chartType === "bars" ? candles[i] : candlesToLineData([candles[i]])[0];
        series.update(bar as never);
      }
    } else {
      series.setData(data);
    }
    prevCandlesRef.current = [...candles];
    } catch {
      // Chart may be disposed
    }
  }, [candles, chartType]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const updateLiveBar = (price: number) => {
      if (!seriesRef.current) return;
      if (!Number.isFinite(price)) return;
      const latest = prevCandlesRef.current;
      if (latest.length === 0) return;
      const last = latest[latest.length - 1];
      const liveBar =
        chartType === "candles" || chartType === "bars"
          ? {
              time: last.time,
              open: last.open,
              high: Math.max(last.high, price),
              low: Math.min(last.low, price),
              close: price,
            }
          : { time: last.time, value: price };
      try {
        series.update(liveBar as never);
      } catch {
        // Chart may be disposed (e.g. unmount or chart type change)
      }
    };

    if (tickerData && candles.length > 0) {
      updateLiveBar(parseFloat(tickerData.lastPrice));
    }

    const poll = async () => {
      if (!seriesRef.current || prevCandlesRef.current.length === 0) return;
      const t = useFutures ? await fetchFuturesTicker24h(pair) : await fetchTicker24h(pair);
      if (t && seriesRef.current) updateLiveBar(parseFloat(t.lastPrice));
    };
    const id = setInterval(poll, 250);
    return () => clearInterval(id);
  }, [tickerData, candles.length, chartType, pair, useFutures]);


  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-lg font-semibold text-[var(--text-primary)]">
            {pair}
          </h2>
          <span className={`font-mono tabular-nums ${ticker && targetChange < 0 ? "text-[var(--accent-sell)]" : "text-[var(--accent-buy)]"}`}>
            {Number.isFinite(targetPrice)
              ? animatedPrice >= 1
                ? `$${animatedPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `$${animatedPrice.toFixed(6)}`
              : "—"}
          </span>
          <span className={`text-sm tabular-nums ${ticker && targetChange < 0 ? "text-[var(--accent-sell)]" : "text-[var(--accent-buy)]"}`}>
            {Number.isFinite(targetChange)
              ? `${animatedChange >= 0 ? "+" : ""}${animatedChange.toFixed(2)}%`
              : "—"}
          </span>
          <span className="text-xs text-[var(--text-muted)]">24h</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={chartTypeRef}>
            <button
              type="button"
              onClick={() => setChartTypeOpen(!chartTypeOpen)}
              className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-cyan)] hover:bg-[var(--bg-elevated)]"
            >
              <ChartTypeIcon type={chartType} />
              <span>{CHART_TYPES.find((t) => t.id === chartType)?.label ?? chartType}</span>
              <svg className={`h-3 w-3 transition-transform ${chartTypeOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {chartTypeOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded border border-[var(--border)] bg-[var(--bg-elevated)] py-1 shadow-lg">
                {CHART_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setChartType(t.id);
                      setChartTypeOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-2">
                      <ChartTypeIcon type={t.id} />
                      <span className="text-[var(--text-primary)]">{t.label}</span>
                    </div>
                    {chartType === t.id && (
                      <svg className="h-4 w-4 text-[var(--accent-cyan)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
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
      </div>
      <div ref={chartContainerRef} className="min-h-0 flex-1 w-full" />
    </div>
  );
}
