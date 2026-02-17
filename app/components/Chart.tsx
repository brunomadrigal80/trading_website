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
import { fetchKlines, fetchFuturesKlines, fetchTicker24h, fetchFuturesTicker24h, type Kline } from "@/lib/kucoin";
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

/** For 1s Line/Area: interpolate between closes so the line is smooth (no stepped blocks). */
function candlesToLineDataSmooth(
  candles: CandlestickData[],
  timeframe: string,
): { time: UTCTimestamp; value: number }[] {
  if (timeframe !== "1s" || candles.length === 0) {
    return candlesToLineData(candles).map((d) => ({ time: d.time as UTCTimestamp, value: d.value }));
  }
  const out: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i < candles.length; i++) {
    const t0 = candles[i].time as number;
    const v0 = candles[i].close;
    out.push({ time: t0 as UTCTimestamp, value: v0 });
    if (i < candles.length - 1) {
      const t1 = (candles[i + 1].time as number) - t0;
      const v1 = candles[i + 1].close;
      for (let j = 1; j <= 4; j++) {
        out.push({
          time: (t0 + (t1 * j) / 5) as UTCTimestamp,
          value: v0 + ((v1 - v0) * j) / 5,
        });
      }
    }
  }
  return out;
}

/** lightweight-charts requires data strictly ascending by time with no duplicate times. */
function sortAndDedupeByTime<T extends { time: UTCTimestamp }>(items: T[]): T[] {
  if (items.length <= 1) return items;
  const byTime = new Map<number, T>();
  for (const item of items) {
    const t = item.time as number;
    byTime.set(t, item);
  }
  return Array.from(byTime.entries()).sort(([a], [b]) => a - b).map(([, v]) => v);
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

const TIMEFRAMES = ["1s", "15m", "1H", "4H", "1D", "1W"] as const;

/** Bar count per interval so each timeframe shows a realistic, distinct time span (like Binance). */
function getKlineLimit(timeframe: (typeof TIMEFRAMES)[number]): number {
  switch (timeframe) {
    case "1s":
      return 240; // ~4h of 1m candles
    case "15m":
      return 96; // 24h
    case "1H":
      return 168; // 1 week
    case "4H":
      return 90; // ~15 days
    case "1D":
      return 60; // ~2 months
    case "1W":
      return 26; // ~6 months
    default:
      return 200;
  }
}

/** How often to refetch klines from API (ms). Shorter intervals = more frequent refetch. */
function getKlinePollMs(timeframe: (typeof TIMEFRAMES)[number]): number {
  switch (timeframe) {
    case "1s":
      return 1000; // 1x/sec
    case "15m":
      return 2000;
    case "1H":
      return 3000;
    case "4H":
      return 5000;
    case "1D":
      return 10000;
    case "1W":
      return 15000;
    default:
      return 2000;
  }
}

/** How often to update the live (rightmost) bar with latest price (ms). Like Binance: ~250ms = 4x/sec. */
function getTickerPollMs(timeframe: (typeof TIMEFRAMES)[number]): number {
  switch (timeframe) {
    case "1s":
      return 200; // ~5x per 1s bar so candles get a real high/low range
    default:
      return 250; // Binance-style: 4x/sec for other intervals
  }
}

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
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("15m");
  const [chartType, setChartType] = useState<(typeof CHART_TYPES)[number]["id"]>("candles");
  const [chartTypeOpen, setChartTypeOpen] = useState(false);
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartTypeRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<{ setData: (d: unknown[]) => void; update: (d: unknown) => void } | null>(null);
  const prevCandlesRef = useRef<CandlestickData[]>([]);
  const lastPriceRef = useRef<number | null>(null);
  const currentBarRef = useRef<{ open: number; high: number; low: number; close: number } | null>(null);
  const currentBarStartTimeRef = useRef<number>(0);
  const tickHistoryRef = useRef<{ time: UTCTimestamp; value: number }[]>([]);
  const candlesRef = useRef<CandlestickData[]>(candles);
  candlesRef.current = candles;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chartTypeRef.current && !chartTypeRef.current.contains(event.target as Node)) {
        setChartTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const klinePollMs = getKlinePollMs(timeframe);
  const isSubSecond = timeframe === "1s";

  useEffect(() => {
    if (isSubSecond) return;
    let mounted = true;
    setCandles([]);
    const limit = getKlineLimit(timeframe);
    const load = async () => {
      const data = useFutures
        ? await fetchFuturesKlines(pair, timeframe, limit)
        : await fetchKlines(pair, timeframe, limit);
      if (mounted && data.length > 0) setCandles(klinesToCandles(data));
    };
    load();
    const id = setInterval(load, klinePollMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [pair, timeframe, useFutures, klinePollMs, isSubSecond]);

  useEffect(() => {
    if (!isSubSecond) return;
    setCandles([]);
    currentBarStartTimeRef.current = 0;
    currentBarRef.current = null;
    const barDurationMs = 1000;
    const fetchPrice = useFutures ? fetchFuturesTicker24h : fetchTicker24h;
    let mounted = true;
    (async () => {
      const t = await fetchPrice(pair);
      const price = t ? parseFloat(t.lastPrice) : NaN;
      if (!mounted || !Number.isFinite(price)) return;
      lastPriceRef.current = price;
      const now = Date.now();
      const bucketMs = Math.floor(now / barDurationMs) * barDurationMs;
      const bucketTime = (bucketMs / 1000) as UTCTimestamp;
      currentBarStartTimeRef.current = bucketMs;
      currentBarRef.current = { open: price, high: price, low: price, close: price };
      const bar: CandlestickData = {
        time: bucketTime,
        open: price,
        high: price,
        low: price,
        close: price,
      };
      setCandles((prev) => [...prev, bar]);
    })();
    const id = setInterval(() => {
      if (!mounted) return;
      const price = lastPriceRef.current ?? NaN;
      if (!Number.isFinite(price)) return;
      lastPriceRef.current = price;
      const now = Date.now();
      const bucketMs = Math.floor(now / barDurationMs) * barDurationMs;
      const bucketTime = (bucketMs / 1000) as UTCTimestamp;
      const series = seriesRef.current;
      if (currentBarStartTimeRef.current === 0) {
        currentBarStartTimeRef.current = bucketMs;
        currentBarRef.current = { open: price, high: price, low: price, close: price };
        const bar: CandlestickData = {
          time: bucketTime,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        setCandles((prev) => [...prev, bar]);
        return;
      }
      if (bucketMs > currentBarStartTimeRef.current) {
        const completed = currentBarRef.current!;
        const completedBar: CandlestickData = {
          time: (currentBarStartTimeRef.current / 1000) as UTCTimestamp,
          open: completed.open,
          high: completed.high,
          low: completed.low,
          close: completed.close,
        };
        currentBarStartTimeRef.current = bucketMs;
        currentBarRef.current = { open: price, high: price, low: price, close: price };
        const newBar: CandlestickData = {
          time: bucketTime,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        setCandles((prev) => [...prev, completedBar, newBar]);
        if (series) {
          try {
            series.update(completedBar as never);
            series.update(newBar as never);
          } catch {
            // ignore
          }
        }
      } else {
        const cur = currentBarRef.current!;
        cur.high = Math.max(cur.high, price);
        cur.low = Math.min(cur.low, price);
        cur.close = price;
        if (series) {
          try {
            series.update({
              time: (currentBarStartTimeRef.current / 1000) as UTCTimestamp,
              open: cur.open,
              high: cur.high,
              low: cur.low,
              close: cur.close,
            } as never);
          } catch {
            // ignore
          }
        }
      }
    }, barDurationMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [pair, timeframe, useFutures, isSubSecond]);

  // Create chart once on mount; remove only on unmount to avoid "Object is disposed" from library paint after remove
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = createChart(container, {
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

    const handleResize = () => {
      if (!chartRef.current) return;
      try {
        chartRef.current.applyOptions({ width: chartContainerRef.current?.clientWidth });
      } catch {
        // Chart may be disposed
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current = null;
      seriesRef.current = null;
      try {
        chart.remove();
      } catch {
        // ignore
      }
    };
  }, []);

  // Update timeScale options and series when timeframe or chartType changes (reuse chart instance)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.applyOptions({
      timeScale: {
        secondsVisible: timeframe === "1s",
        tickMarkFormatter: createTickMarkFormatter(timeframe),
        barSpacing: 6,
        minBarSpacing: 0.5,
      },
    });

    const seriesOptions = {
      candlestick: {
        upColor: "#0ecb81",
        downColor: "#f6465d",
        borderDownColor: "#f6465d",
        borderUpColor: "#0ecb81",
        wickDownColor: "#f6465d",
        wickUpColor: "#0ecb81",
        wickVisible: true,
        borderVisible: true,
      },
      line: { color: "#0ab3e6", lineWidth: 2 as const },
      area: { lineColor: "#0ab3e6", topColor: "rgba(10, 179, 230, 0.4)", bottomColor: "rgba(10, 179, 230, 0)" },
      bars: {
        upColor: "#0ecb81",
        downColor: "#f6465d",
      },
    };

    const oldSeries = seriesRef.current;
    if (oldSeries) {
      try {
        chart.removeSeries(oldSeries as unknown as ReturnType<typeof chart.addSeries>);
      } catch {
        // ignore
      }
    }

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
    series.setData([]);
    const currentCandles = candlesRef.current;
    if (currentCandles.length > 0) {
      const raw = chartType === "candles" || chartType === "bars" ? currentCandles : candlesToLineData(currentCandles);
      const data = sortAndDedupeByTime(raw as { time: UTCTimestamp }[]);
      series.setData(data);
      prevCandlesRef.current = [...currentCandles];
      try {
        chartRef.current?.timeScale().fitContent();
        chartRef.current?.timeScale().scrollToRealTime();
      } catch {
        // ignore
      }
    }
  }, [timeframe, chartType]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    try {
      if (candles.length === 0) {
        series.setData([]);
        prevCandlesRef.current = [];
        return;
      }

      const prev = prevCandlesRef.current;
      const raw =
        chartType === "candles" || chartType === "bars"
          ? candles
          : candlesToLineDataSmooth(candles, timeframe);
      const data = sortAndDedupeByTime(raw as { time: UTCTimestamp }[]);

      if (prev.length === 0) {
        series.setData(data);
        if (timeframe === "1s" && (chartType === "line" || chartType === "area") && tickHistoryRef.current.length > 0) {
          const lastTime = (candles[candles.length - 1]?.time as number) ?? 0;
          for (const p of tickHistoryRef.current) {
            if ((p.time as number) >= lastTime) series.update(p as never);
          }
        }
        prevCandlesRef.current = [...candles];
        chartRef.current?.timeScale().fitContent();
        chartRef.current?.timeScale().scrollToRealTime();
        return;
      }

      const lastPrev = prev[prev.length - 1];
      const lastNew = candles[candles.length - 1];
      const prevTime = (lastPrev as { time: UTCTimestamp }).time;
      const newTime = (lastNew as { time: UTCTimestamp }).time;

      const reapplyTicks = () => {
        if (timeframe === "1s" && (chartType === "line" || chartType === "area") && tickHistoryRef.current.length > 0) {
          const lastTime = (candles[candles.length - 1]?.time as number) ?? 0;
          for (const p of tickHistoryRef.current) {
            if ((p.time as number) >= lastTime) series.update(p as never);
          }
        }
      };

      if (prevTime === newTime) {
        const bar =
          chartType === "candles" || chartType === "bars"
            ? lastNew
            : { time: lastNew.time, value: lastNew.close };
        series.update(bar as never);
      } else if (candles.length > prev.length && !(timeframe === "1s" && (chartType === "line" || chartType === "area"))) {
        for (let i = prev.length; i < candles.length; i++) {
          const bar = chartType === "candles" || chartType === "bars" ? candles[i] : candlesToLineData([candles[i]])[0];
          series.update(bar as never);
        }
      } else {
        series.setData(data);
        reapplyTicks();
      }
      prevCandlesRef.current = [...candles];
    } catch {
      // Chart may be disposed
    }
  }, [candles, chartType, timeframe]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const updateLiveBar = (price: number) => {
      if (!seriesRef.current) return;
      if (!Number.isFinite(price)) return;
      const latest = prevCandlesRef.current;
      if (latest.length === 0) return;
      const last = latest[latest.length - 1];
      const is1sLineArea = timeframe === "1s" && (chartType === "line" || chartType === "area");
      const liveBar =
        chartType === "candles" || chartType === "bars"
          ? {
              time: last.time,
              open: last.open,
              high: Math.max(last.high, price),
              low: Math.min(last.low, price),
              close: price,
            }
          : is1sLineArea
            ? { time: (Date.now() / 1000) as UTCTimestamp, value: price }
            : { time: last.time, value: price };
      if (is1sLineArea) {
        const barStart = currentBarStartTimeRef.current / 1000;
        tickHistoryRef.current = tickHistoryRef.current.filter((pt) => (pt.time as number) >= barStart);
        tickHistoryRef.current.push({ time: liveBar.time as UTCTimestamp, value: price });
      }
      try {
        series.update(liveBar as never);
      } catch {
        // Chart may be disposed (e.g. unmount or chart type change)
      }
    };

    const updateSubSecondBar = (price: number) => {
      const cur = currentBarRef.current;
      const startMs = currentBarStartTimeRef.current;
      if (!cur || startMs === 0 || !seriesRef.current) return;
      cur.high = Math.max(cur.high, price);
      cur.low = Math.min(cur.low, price);
      cur.close = price;
      try {
        seriesRef.current.update({
          time: (startMs / 1000) as UTCTimestamp,
          open: cur.open,
          high: cur.high,
          low: cur.low,
          close: cur.close,
        } as never);
      } catch {
        // ignore
      }
    };

    if (timeframe !== "1s" || (chartType !== "line" && chartType !== "area")) {
      tickHistoryRef.current = [];
    }

    if (tickerData) {
      const p = parseFloat(tickerData.lastPrice);
      if (Number.isFinite(p)) {
        lastPriceRef.current = p;
        if (isSubSecond) updateSubSecondBar(p);
        else if (candles.length > 0) updateLiveBar(p);
      }
    }

    const poll = async () => {
      const t = useFutures ? await fetchFuturesTicker24h(pair) : await fetchTicker24h(pair);
      if (t) {
        const p = parseFloat(t.lastPrice);
        if (Number.isFinite(p)) {
          lastPriceRef.current = p;
          if (isSubSecond) updateSubSecondBar(p);
          else if (seriesRef.current && prevCandlesRef.current.length > 0) updateLiveBar(p);
        }
      }
    };
    const tickerPollMs = getTickerPollMs(timeframe);
    const id = setInterval(poll, tickerPollMs);
    return () => clearInterval(id);
  }, [tickerData, candles.length, chartType, pair, useFutures, timeframe]);


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
