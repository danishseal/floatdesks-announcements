# Floatdesks markets

Markets and Top 200 from `../site`, inside the original announcements layout. The mirrored page continues to own the header, sidebar, frame, animations, typography and scrolling; React portals mount only the Markets and Top 200 content.

- `/`: Float reference market universe, search, expandable historical charts, reserves and oracle sections. `/market` and `/markets` redirect here.
- `/announcements`: retained but removed from the header. Products and Blog are also hidden from the header.
- `/top200`: all 200 companies, Robinhood coverage filters, search and progressive loading.

Run `npm run dev` for local development. Validate with `npm run lint` and `npm run build`. In environments that block Turbopack worker ports, use `npm run build -- --webpack`.

`app/data/universe.json` preserves the September 1, 2026 snapshot from `../site/home/universe-data.js`. Prices retain their original currencies. The market universe is selected using the ticker mapping in the original `markets-app.js`; this is not a list of confirmed live listings. The original indexer at port 8462 is unavailable here. Live listings, funding, wallet trading and reserve balances are not connected in this version; those states are explicitly marked unavailable. Oracle labels describe the original site's configuration, not verified feed health.

Fonts and the original announcements mirror are served locally from `public/dottxt`.
