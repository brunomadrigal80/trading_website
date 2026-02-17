const KUCOIN_API = "/api/kucoin";
const KUCOIN_FUTURES_API = "/api/kucoin-futures";

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

/** Futures: "BTCUSDT" -> "XBTUSDTM", "ETHUSDT" -> "ETHUSDTM", etc. */
const FUTURES_SYMBOL_MAP: Record<string, string> = {
  BTCUSDT: "XBTUSDTM",
};
function toFuturesSymbol(pair: string): string {
  const s = pair.replace("/", "");
  return FUTURES_SYMBOL_MAP[s] ?? `${s.slice(0, -4)}USDTM`;
}

/** Futures symbol "XBTUSDTM" -> "BTCUSDT" for app */
function futuresToAppSymbol(symbol: string): string {
  if (symbol === "XBTUSDTM") return "BTCUSDT";
  if (symbol.endsWith("USDTM")) return symbol.slice(0, -1);
  return symbol;
}

const DEFAULT_TICKER_SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT",
  "AVAXUSDT", "LINKUSDT", "MATICUSDT", "DOTUSDT", "ADAUSDT", "ATOMUSDT",
  "LTCUSDT", "UNIUSDT", "ETCUSDT", "APTUSDT", "ARBUSDT", "OPUSDT",
  "FILUSDT", "INJUSDT", "SUIUSDT", "NEARUSDT", "STXUSDT",
];

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

export async function fetchTickers24h(symbols?: string[]): Promise<Ticker24h[]> {
  try {
    const toFetch = symbols?.length ? symbols : DEFAULT_TICKER_SYMBOLS;
    const results = await Promise.all(
      toFetch.map((s) => fetchTicker24h(s))
    );
    const tickers = results.filter((t): t is Ticker24h => t != null);
    if (symbols?.length) return tickers;
    return tickers.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)).slice(0, 20);
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

// --- Futures ---

export async function fetchFuturesTicker24h(symbol: string): Promise<Ticker24h | null> {
  const fsym = toFuturesSymbol(symbol);
  try {
    const [tickerRes, statsRes] = await Promise.all([
      fetch(`${KUCOIN_FUTURES_API}/api/v1/ticker?symbol=${fsym}`, fetchOpts),
      fetch(`${KUCOIN_FUTURES_API}/api/v1/trade-statistics?symbol=${fsym}`, fetchOpts),
    ]);
    if (!tickerRes.ok) return null;
    const tickerJson = await tickerRes.json();
    const ticker = tickerJson?.data;
    if (!ticker) return null;
    let changeRate = "0";
    let volume = "0";
    let quoteVolume = "0";
    if (statsRes.ok) {
      const statsJson = await statsRes.json();
      const stats = statsJson?.data;
      if (stats) {
        changeRate = stats.changeRate != null ? (Number(stats.changeRate) * 100).toFixed(2) : "0";
        volume = String(stats.volume ?? "0");
        quoteVolume = String(stats.turnover ?? "0");
      }
    }
    return {
      symbol: futuresToAppSymbol(fsym),
      lastPrice: String(ticker.price ?? "0"),
      priceChangePercent: changeRate,
      volume,
      quoteVolume,
    };
  } catch {
    return null;
  }
}

export async function fetchAllFuturesTickers24h(): Promise<Ticker24h[]> {
  try {
    const res = await fetch(`${KUCOIN_FUTURES_API}/api/v1/allTickers`, fetchOpts);
    if (!res.ok) return [];
    const json = await res.json();
    const tickers = json?.data;
    if (!Array.isArray(tickers)) return [];
    return tickers
      .map((t: { symbol?: string; price?: string }) => {
        if (!t?.symbol) return null;
        return {
          symbol: futuresToAppSymbol(t.symbol),
          lastPrice: String(t.price ?? "0"),
          priceChangePercent: "0",
          volume: "0",
          quoteVolume: "0",
        } as Ticker24h;
      })
      .filter((t: Ticker24h | null): t is Ticker24h => t != null);
  } catch {
    return [];
  }
}

export async function fetchFuturesTickers24h(symbols?: string[]): Promise<Ticker24h[]> {
  try {
    const toFetch = symbols?.length ? symbols : DEFAULT_TICKER_SYMBOLS;
    const results = await Promise.all(toFetch.map((s) => fetchFuturesTicker24h(s)));
    const tickers = results.filter((t): t is Ticker24h => t != null);
    return symbols?.length ? tickers : tickers.slice(0, 15);
  } catch {
    return [];
  }
}

export async function fetchFuturesOrderBook(symbol: string, limit = 20): Promise<OrderBook | null> {
  try {
    const res = await fetch(
      `${KUCOIN_FUTURES_API}/api/v1/level2/depth20?symbol=${toFuturesSymbol(symbol)}`,
      fetchOpts
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data || !Array.isArray(data.bids) || !Array.isArray(data.asks)) return null;
    return {
      bids: (data.bids as OrderBookLevel[]).slice(0, limit),
      asks: (data.asks as OrderBookLevel[]).slice(0, limit),
      lastUpdateId: Number(data.sequence) || 0,
    };
  } catch {
    return null;
  }
}

// KuCoin futures REST kline endpoint expects granularity in minutes (as a stringified number),
// e.g. "1", "5", "15", "60", "240", etc.
const FUTURES_GRANULARITY_MAP: Record<string, number> = {
  "0.25s": 1,
  "1s": 1,
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "1h": 60,
  "1H": 60,
  "4H": 240,
  "1D": 1440,
  "1W": 10080,
};

export async function fetchFuturesKlines(
  symbol: string,
  interval: string,
  limit = 200
): Promise<Kline[]> {
  const granMinutes = FUTURES_GRANULARITY_MAP[interval] ?? 60;
  const now = Date.now();
  const endAt = now;
  // Request roughly `limit` candles back in time
  const startAt = now - granMinutes * 60 * 1000 * limit;
  try {
    const res = await fetch(
      `${KUCOIN_FUTURES_API}/api/v1/kline/query?symbol=${toFuturesSymbol(
        symbol,
      )}&granularity=${granMinutes}&startAt=${Math.floor(startAt)}&endAt=${Math.floor(endAt)}`,
      fetchOpts
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    if (!Array.isArray(data)) return [];
    const klines = data.map((row: unknown[]) => {
      const time = toMsTime(Number(row[0]));
      const open = String(row[1] ?? "0");
      const high = String(row[2] ?? "0");
      const low = String(row[3] ?? "0");
      const close = String(row[4] ?? "0");
      const vol = Number(row[5]) ?? 0;
      return [time, open, high, low, close, String(vol), 0, "0", 0, "0", "0", "0"] as Kline;
    });
    klines.reverse();
    return klines.slice(-limit);
  } catch {
    return [];
  }
}
