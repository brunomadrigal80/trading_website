# Trading

A lightweight, TypeScript-based trading dashboard built with Next.js that consumes KuCoin public market data and provides real-time market views, charts, order book, and portfolio components.

**Project purpose:** Provide a responsive single-page trading UI that demonstrates integration with KuCoin public market endpoints, charting via `lightweight-charts`, React state management, and wallet integrations via `wagmi` and `@reown/appkit`.

**Live features:**
- Market list and per-market ticker overview
- Candlestick charts (client-side) with historical klines
- Order book and recent trades
- Order entry panel (UI-only; no custody or live orders by default)
- Wallet/connect integration using `wagmi` and `@reown/appkit`

**Tech stack:**
- Framework: `Next.js` (app directory, TypeScript)
- UI: `tailwindcss`, `tw-modern-ui`, `porto`
- Charts: `lightweight-charts`
- Wallets: `wagmi`, `viem`, `@reown/appkit`
- Data: KuCoin public market endpoints proxied through the app route `api/kucoin`

**Repository structure (high level):**
- [app](app) — Next.js app router and pages (server + client components)
- [app/api/kucoin](app/api/kucoin) — API route that forwards/normalizes KuCoin public market responses
- [app/components](app/components) — UI building blocks (Chart.tsx, MarketList.tsx, OrderBook.tsx, OrderPanel.tsx, etc.)
- [lib/kucoin.ts](lib/kucoin.ts) — client helper functions to fetch/normalize KuCoin data
- [config/index.ts](config/index.ts) — `@reown/appkit` + `wagmi` configuration

**Requirements**
- Node.js 18 or later
- npm, pnpm, or yarn

**Getting started (development)**
1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000` in your browser.

**Build / production**

```bash
npm run build
npm run start
```

**Environment**
- `NEXT_PUBLIC_PROJECT_ID` — public project ID for `@reown/appkit`; the app provides a default value in `config/index.ts` for local development. Set this in `.env` to use your own Reown project ID.

Example `.env`:

```bash
NEXT_PUBLIC_PROJECT_ID=your_public_project_id_here
```

Note: KuCoin public market endpoints used by this app do not require API keys. If you extend the app to use private KuCoin endpoints, keep API keys and secrets out of the client bundle and implement server-side signing.

**Scripts**
- `dev`: development server with Next.js
- `build`: production build
- `start`: start production server
- `lint`: run ESLint
- `dev:fresh`, `dev:webpack`, `dev:slow`: alternative dev helpers included in `package.json`

**Key files**
- [lib/kucoin.ts](lib/kucoin.ts) — normalization and fetching helpers for KuCoin
- [app/components/Chart.tsx](app/components/Chart.tsx) — charting component
- [config/index.ts](config/index.ts) — wallet and network configuration

**Development notes & tips**
- The API proxy at [app/api/kucoin](app/api/kucoin) centralizes KuCoin requests and response shapes; update `lib/kucoin.ts` if you adjust endpoint contracts.
- For memory-heavy environments, use `npm run dev:slow` or increase Node memory (script provided) during development.

**Contributing**
- Open issues and PRs are welcome. Keep changes focused and include a short description of how to run and test UI changes.

If you'd like, I can add a CI workflow, sample tests, or a short development checklist next.
