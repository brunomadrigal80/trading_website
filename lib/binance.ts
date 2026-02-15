const BINANCE_API = "/api/binance";
const BINANCE_FUTURES_API = "/api/binance-futures";

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

function toSymbol(pair: string): string {
  return pair.replace("/", "");
}

const fetchOpts: RequestInit = { cache: "no-store" };

export async function fetchTicker24h(symbol: string): Promise<Ticker24h | null> {
  try {
    const res = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${toSymbol(symbol)}`, fetchOpts);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchTickers24h(symbols?: string[]): Promise<Ticker24h[]> {
  try {
    const res = await fetch(`${BINANCE_API}/ticker/24hr`, fetchOpts);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    const usdt = data.filter((t: Ticker24h) => t?.symbol?.endsWith?.("USDT"));
    if (symbols?.length) {
      const set = new Set(symbols.map(toSymbol));
      return usdt.filter((t) => set.has(t.symbol));
    }
    return usdt.slice(0, 15);
  } catch {
    return [];
  }
}

export async function fetchOrderBook(symbol: string, limit = 20): Promise<OrderBook | null> {
  try {
    const res = await fetch(`${BINANCE_API}/depth?symbol=${toSymbol(symbol)}&limit=${limit}`, fetchOpts);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.bids) || !Array.isArray(data.asks)) return null;
    return {
      bids: data.bids,
      asks: data.asks,
      lastUpdateId: data.lastUpdateId,
    };
  } catch {
    return null;
  }
}

const INTERVAL_MAP: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
  "1W": "1w",
};

export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 200
): Promise<Kline[]> {
  const binanceInterval = INTERVAL_MAP[interval] ?? "1h";
  try {
    const res = await fetch(
      `${BINANCE_API}/klines?symbol=${toSymbol(symbol)}&interval=${binanceInterval}&limit=${limit}`,
      fetchOpts
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchFuturesTicker24h(symbol: string): Promise<Ticker24h | null> {
  try {
    const res = await fetch(`${BINANCE_FUTURES_API}/ticker/24hr?symbol=${toSymbol(symbol)}`, fetchOpts);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchFuturesTickers24h(symbols?: string[]): Promise<Ticker24h[]> {
  try {
    const res = await fetch(`${BINANCE_FUTURES_API}/ticker/24hr`, fetchOpts);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    const usdt = data.filter((t: Ticker24h) => t?.symbol?.endsWith?.("USDT"));
    if (symbols?.length) {
      const set = new Set(symbols.map(toSymbol));
      return usdt.filter((t) => set.has(t.symbol));
    }
    return usdt.slice(0, 15);
  } catch {
    return [];
  }
}

export async function fetchFuturesOrderBook(symbol: string, limit = 20): Promise<OrderBook | null> {
  try {
    const res = await fetch(`${BINANCE_FUTURES_API}/depth?symbol=${toSymbol(symbol)}&limit=${limit}`, fetchOpts);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.bids) || !Array.isArray(data.asks)) return null;
    return {
      bids: data.bids,
      asks: data.asks,
      lastUpdateId: data.lastUpdateId,
    };
  } catch {
    return null;
  }
}

export async function fetchFuturesKlines(
  symbol: string,
  interval: string,
  limit = 200
): Promise<Kline[]> {
  const binanceInterval = INTERVAL_MAP[interval] ?? "1h";
  try {
    const res = await fetch(
      `${BINANCE_FUTURES_API}/klines?symbol=${toSymbol(symbol)}&interval=${binanceInterval}&limit=${limit}`,
      fetchOpts
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
