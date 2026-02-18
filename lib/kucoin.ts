const KUCOIN_API = "/api/kucoin";

export type Ticker24h = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
};

export type OrderBookLevel = [string, string];

export type OrderBook = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateId: number;
};

export type Kline = [number, string, string, string, string, string, number, string, number, string, string, string];

/** Single spot trade from /api/v1/market/histories (time in ms). */
export type SpotTrade = {
  time: number;
  price: string;
  size: string;
  side: string;
  sequence?: string;
};

/** Spot: "BTCUSDT" or "BTC/USDT" -> "BTC-USDT" */
function toSpotSymbol(pair: string): string {
  const s = pair.replace("/", "");
  if (s.length >= 6 && s.endsWith("USDT")) {
    return `${s.slice(0, -4)}-USDT`;
  }
  return pair.replace("/", "-");
}

/** Normalize to "BTCUSDT" for app display (from KuCoin "BTC-USDT") */
function toAppSymbol(kucoinSymbol: string): string {
  return kucoinSymbol.replace("-", "");
}

const fetchOpts: RequestInit = { cache: "no-store" };

// --- Spot ---

export async function fetchTicker24h(symbol: string): Promise<Ticker24h | null> {
  try {
    const res = await fetch(
      `${KUCOIN_API}/api/v1/market/stats?symbol=${toSpotSymbol(symbol)}`,
      fetchOpts
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data) return null;
    const changeRate = data.changeRate != null ? (Number(data.changeRate) * 100).toFixed(2) : "0";
    return {
      symbol: toAppSymbol(data.symbol ?? symbol),
      lastPrice: String(data.last ?? "0"),
      priceChangePercent: changeRate,
      volume: String(data.vol ?? "0"),
      quoteVolume: String(data.volValue ?? "0"),
    };
  } catch {
    return null;
  }
}

export async function fetchAllTickers24h(): Promise<Ticker24h[]> {
  try {
    const res = await fetch(`${KUCOIN_API}/api/v1/market/allTickers`, fetchOpts);
    if (!res.ok) return [];
    const json = await res.json();
    const tickers = json?.data?.ticker;
    if (!Array.isArray(tickers)) return [];
    return tickers
      .map((t: { symbol?: string; last?: string; changeRate?: number; vol?: string; volValue?: string }) => {
        if (!t?.symbol) return null;
        const changeRate = t.changeRate != null ? (Number(t.changeRate) * 100).toFixed(2) : "0";
        return {
          symbol: toAppSymbol(t.symbol),
          lastPrice: String(t.last ?? "0"),
          priceChangePercent: changeRate,
          volume: String(t.vol ?? "0"),
          quoteVolume: String(t.volValue ?? "0"),
        } as Ticker24h;
      })
      .filter((t: Ticker24h | null): t is Ticker24h => t != null);
  } catch {
    return [];
  }
}

export async function fetchOrderBook(symbol: string, limit = 20): Promise<OrderBook | null> {
  try {
    const level = limit <= 20 ? "level2_20" : "level2_100";
    const res = await fetch(
      `${KUCOIN_API}/api/v1/market/orderbook/${level}?symbol=${toSpotSymbol(symbol)}`,
      fetchOpts
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data || !Array.isArray(data.bids) || !Array.isArray(data.asks)) return null;
    return {
      bids: data.bids.slice(0, limit),
      asks: data.asks.slice(0, limit),
      lastUpdateId: Number(data.sequence) || 0,
    };
  } catch {
    return null;
  }
}

const SPOT_INTERVAL_MAP: Record<string, string> = {
  "0.25s": "1min",
  "1s": "1min",
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "1H": "1hour",
  "4H": "4hour",
  "1D": "1day",
  "1W": "1week",
};

/** KuCoin returns time in seconds; normalize to ms for app (Chart expects k[0] in ms). */
function toMsTime(t: number): number {
  return t > 0 && t < 1e12 ? t * 1000 : t;
}

/** KuCoin candle: [time, open, close, high, low, volume, amount] -> Binance-style [time, open, high, low, close, volume, ...] */
function mapSpotCandle(row: unknown[]): Kline {
  const time = toMsTime(Number(row[0]));
  const open = String(row[1] ?? "0");
  const close = String(row[2] ?? "0");
  const high = String(row[3] ?? "0");
  const low = String(row[4] ?? "0");
  const vol = Number(row[5]) ?? 0;
  return [time, open, high, low, close, String(vol), 0, "0", 0, "0", "0", "0"];
}

export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 200
): Promise<Kline[]> {
  const type = SPOT_INTERVAL_MAP[interval] ?? "1hour";
  try {
    const res = await fetch(
      `${KUCOIN_API}/api/v1/market/candles?symbol=${toSpotSymbol(symbol)}&type=${type}`,
      fetchOpts
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    if (!Array.isArray(data)) return [];
    const klines = data.map((row: unknown[]) => mapSpotCandle(row));
    klines.reverse();
    return klines.slice(-limit);
  } catch {
    return [];
  }
}

/** Fetch last 100 spot trades. KuCoin returns time in nanoseconds; we normalize to ms. */
export async function fetchSpotTrades(symbol: string): Promise<SpotTrade[]> {
  try {
    const res = await fetch(
      `${KUCOIN_API}/api/v1/market/histories?symbol=${toSpotSymbol(symbol)}`,
      fetchOpts
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    if (!Array.isArray(data)) return [];
    return data.map((t: { time?: number; price?: string; size?: string; side?: string; sequence?: string }) => {
      const rawTime = Number(t.time);
      const timeMs = rawTime > 1e15 ? Math.floor(rawTime / 1e6) : rawTime;
      return {
        time: timeMs,
        price: String(t.price ?? "0"),
        size: String(t.size ?? "0"),
        side: String(t.side ?? ""),
        sequence: t.sequence != null ? String(t.sequence) : undefined,
      } as SpotTrade;
    });
  } catch {
    return [];
  }
}

/** Aggregate trades into OHLCV candles by time period. Returns Kline[] (time in ms). */
export function aggregateTradesToKlines(
  trades: SpotTrade[],
  periodMs: number,
  maxCandles: number
): Kline[] {
  if (periodMs <= 0 || trades.length === 0) return [];
  const sortedTrades = [...trades].sort((a, b) => a.time - b.time);
  const byPeriod = new Map<number, { open: number; high: number; low: number; close: number; volume: number }>();
  for (const t of sortedTrades) {
    const bucket = Math.floor(t.time / periodMs) * periodMs;
    const price = parseFloat(t.price) || 0;
    const vol = parseFloat(t.size) || 0;
    let c = byPeriod.get(bucket);
    if (!c) {
      c = { open: price, high: price, low: price, close: price, volume: vol };
      byPeriod.set(bucket, c);
    } else {
      c.high = Math.max(c.high, price);
      c.low = Math.min(c.low, price);
      c.close = price;
      c.volume += vol;
    }
  }
  const sorted = Array.from(byPeriod.entries()).sort(([a], [b]) => a - b);
  const slice = sorted.slice(-maxCandles);
  return slice.map(([time, c]) => [
    time,
    String(c.open),
    String(c.high),
    String(c.low),
    String(c.close),
    String(c.volume),
    0,
    "0",
    0,
    "0",
    "0",
    "0",
  ] as Kline);
}
