"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { fetchAllTickers24h, fetchAllFuturesTickers24h, type Ticker24h } from "@/lib/binance";

const TICKER_POLL_MS = 4000;

type TickerContextValue = {
  tickers: Ticker24h[];
  getTicker: (symbol: string) => Ticker24h | undefined;
  getTickersBySymbols: (symbols: string[]) => Ticker24h[];
  topByVolume: (n: number) => Ticker24h[];
};

const TickerContext = createContext<TickerContextValue | null>(null);

const TICKER_BAR_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "AVAX", "LINK", "MATIC", "DOT"].map(
  (s) => `${s}USDT`
);

function toSymbol(s: string): string {
  return s.replace("/", "").endsWith("USDT") ? s.replace("/", "") : `${s}USDT`;
}

export function TickerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const useFutures = pathname?.includes("/futures") ?? false;
  const [tickers, setTickers] = useState<Ticker24h[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = useFutures ? await fetchAllFuturesTickers24h() : await fetchAllTickers24h();
      if (mounted) setTickers(data);
    };
    load();
    const id = setInterval(load, TICKER_POLL_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [useFutures]);

  const getTicker = useCallback(
    (symbol: string): Ticker24h | undefined => {
      const s = toSymbol(symbol);
      return tickers.find((t) => t.symbol === s);
    },
    [tickers]
  );

  const getTickersBySymbols = useCallback(
    (symbols: string[]): Ticker24h[] => {
      const map = new Map(tickers.map((t) => [t.symbol, t]));
      const ordered: Ticker24h[] = [];
      for (const s of symbols.map(toSymbol)) {
        const t = map.get(s);
        if (t) ordered.push(t);
      }
      return ordered;
    },
    [tickers]
  );

  const topByVolume = useCallback(
    (n: number): Ticker24h[] =>
      [...tickers]
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .filter((t) => t.symbol.endsWith("USDT"))
        .slice(0, n),
    [tickers]
  );

  const value: TickerContextValue = {
    tickers,
    getTicker,
    getTickersBySymbols,
    topByVolume,
  };

  return <TickerContext.Provider value={value}>{children}</TickerContext.Provider>;
}

export function useTickers() {
  const ctx = useContext(TickerContext);
  if (!ctx) throw new Error("useTickers must be used within TickerProvider");
  return ctx;
}

export function useTickerBar(): Ticker24h[] {
  const { getTickersBySymbols } = useTickers();
  const result = getTickersBySymbols(TICKER_BAR_SYMBOLS);
  if (result.length > 0) return result;
  return TICKER_BAR_SYMBOLS.map((s) => ({
    symbol: s,
    lastPrice: "—",
    priceChangePercent: "0",
    volume: "0",
    quoteVolume: "0",
  })) as Ticker24h[];
}
