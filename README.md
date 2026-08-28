# VOO DCA Calculator

A responsive Next.js historical dollar-cost averaging calculator with raw-price dividend processing, interactive charts, year summaries, SEO metadata, and deterministic finance tests.

## Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/voo-dca-calculator`. Run `npm test` and `npm run build` before deployment.

## Market data: production connection

The repository deliberately does **not** ship invented VOO history. With no environment configuration, the API route returns an explicitly labeled synthetic development dataset so the interface and engine can be evaluated. It must not be presented as historical performance.

Set `MARKET_DATA_API_URL` to a server endpoint that accepts `symbol`, `start`, and `end` query parameters. Optionally set `MARKET_DATA_API_KEY`; it is sent as a Bearer token from the server only. The endpoint must return:

```json
{"symbol":"VOO","prices":[{"date":"2024-01-02","close":436.80}],"dividends":[{"date":"2024-03-27","amount":1.5429}],"source":"Provider name"}
```

Prices **must be unadjusted daily closes**. Dividend events must be cash paid per share. Validate provider licensing, split handling, exchange calendars, data completeness, and whether its date is ex-date or payment date. Do not supply adjusted closes while also supplying dividends. `lib/data/marketData.ts` is the provider boundary; a new provider can implement `MarketDataProvider` without changing the calculator or engine.

Set `NEXT_PUBLIC_SITE_URL` to the production origin for canonical and sitemap URLs.

## Calculation assumptions

Contributions are bought on the first available trading day in each calendar month. The initial investment is added to the first purchase. Fractional shares are supported. Dividends are processed on the first price date on or after the dividend event; DRIP buys shares at that raw close, while non-DRIP distributions remain cash. Taxes, fees, slippage, and spreads are excluded. The annualized display is a simplified contribution-multiple CAGR and is labeled accordingly—not an IRR.
