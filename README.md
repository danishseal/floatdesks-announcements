# Floatdesks markets

Markets and Top 200 from `../site`, inside the original announcements layout. The mirrored page continues to own the header, sidebar, frame, animations, typography and scrolling; React portals mount only the Markets and Top 200 content.

- `/`: Float market universe, search, latest quote widgets and expandable TradingView charts, reserves and oracle sections. `/market` and `/markets` redirect here.
- `/announcements`: retained but removed from the header. Products and Blog are also hidden from the header.
- `/top200`: all 200 companies, Robinhood coverage filters, search and progressive loading.

Run `npm run dev` for local development. Validate with `npm run lint` and `npm run build`. In environments that block Turbopack worker ports, use `npm run build -- --webpack`.

`app/data/universe.json` preserves the September 1, 2026 company reference list from `../site/home/universe-data.js`. Only company identity, ordering and Robinhood coverage are used by the market UI. Snapshot prices, market caps, returns, revenue and historical points are not displayed. Top 200 membership and ordering remain a reference universe, not a current market-cap ranking.

Both market pages render compact native quote rows using `/api/market-quotes`, which fetches TradingView screener values and caches upstream results for 60 seconds. The client refreshes every minute. Prices retain listing currencies; market caps are explicitly requested in USD. Six-month returns and per-exchange delay labels come from the provider. Failed requests clear quotes and show unavailable values rather than the old snapshot. The public screener endpoint is not a contracted market-data API and may change or become unavailable.

Expanded rows use TradingView’s Advanced Chart widget. The large Symbol Info cards are no longer mounted. Compact six-month sparklines use daily closing prices from Yahoo Finance through `/api/market-history`. They load near the viewport, refresh every minute while visible, and never fall back to snapshot points. The server validates tickers against the company universe and caches history for 60 seconds. Unavailable history has an explicit placeholder and automatically retries.
The original Float indexer at port 8462 is unavailable here. Live listings, funding, wallet trading and reserve balances are not connected. Oracle labels describe the original site's configuration, not verified feed health.

Fonts and the original announcements mirror are served locally from `public/dottxt`.

