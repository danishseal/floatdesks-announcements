"use client";

import { useState } from "react";
import universe from "./data/universe.json";

type Company = typeof universe[number];
const floatTickers = ["2222.SR", "005930.KS", "0700.HK", "MC.PA", "300750.SZ", "600519.SS", "NESN.SW", "RMS.PA", "2454.TW", "9984.T", "7974.T"];
const cap = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(2)}T` : `$${n.toFixed(1)}B`;
function Chart({ company, large = false }: { company: Company; large?: boolean }) {
  const pts = company.pts ?? [];
  if (pts.length < 2) return <span className="muted">Chart unavailable</span>;
  const values = pts.map(p => p[1]);
  const low = Math.min(...values), high = Math.max(...values);
  return <svg className={large ? "chart large" : "chart"} viewBox="0 0 600 160" preserveAspectRatio="none" role="img" aria-label={`${company.name} six-month price history`}>
    {large && [30, 80, 130].map(y => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#e5e5e5" />)}
    <polyline points={values.map((p, i) => `${i / (values.length - 1) * 600},${145 - (p - low) / (high - low || 1) * 130}`).join(" ")} fill="none" stroke="currentColor" strokeWidth={large ? 2 : 1.5} vectorEffect="non-scaling-stroke" />
  </svg>;
}
export default function MarketBoard({ view = "markets" }: { view?: "markets" | "top200" }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(20);
  const [open, setOpen] = useState<string | null>(null);
  const top = view === "top200";
  const source = top ? universe : universe.filter(c => floatTickers.includes(c.ticker));
  const rows = source.filter(c => (!top || filter === "all" || (filter === "on" ? c.on : !c.on)) && `${c.name} ${c.ticker}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="float-content">
    <div className="float-intro h3 h3--small">{top ? "The world’s 200 largest companies, ranked by market cap." : "Explore Float’s global market universe."}<p className="float-muted">Reference snapshot · September 1, 2026</p></div>
    <div className="float-toolbar">
      <div className="float-filters" aria-label="Coverage filters">{(top ? [["all", "All companies"], ["on", "On Robinhood"], ["off", "Not on Robinhood"]] : [["all", "Float universe"]]).map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => { setFilter(id); setLimit(20); }}>{label} <sup>{id === "all" ? source.length : source.filter(c => id === "on" ? c.on : !c.on).length}</sup></button>)}</div>
      <label className="float-search"><input value={query} onChange={e => { setQuery(e.target.value); setLimit(20); }} placeholder="Search companies" aria-label="Search companies" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}>×</button>}</label>
    </div>
    <div className="AnnouncementsList_announcementsList__list__y5pZs">{rows.slice(0, limit).map(c => <article className="PostPreview_postPreview__4Cl8Z" key={c.ticker}>
      <button className="float-article" aria-expanded={open === c.ticker} aria-controls={`detail-${c.ticker}`} onClick={() => setOpen(open === c.ticker ? null : c.ticker)}>
        <span className="PostPreview_postPreview__header__Vumpb"><span className="h3 h3--small">{top ? `#${String(c.rank).padStart(3, "0")}` : c.ticker}</span><span className="float-muted">{top ? (c.on ? "On Robinhood" : "Not on Robinhood") : "Reference market"}</span></span>
        <span className="PostPreview_postPreview__content__qwniW float-company-summary"><span className="PostPreview_postPreview__title__c1oda"><span className="h3 h3--medium float-company-title">{c.name}</span></span><span className="PostPreview_postPreview__excerpt__pDb2h"><span className="h3 h3--small">{c.ticker} · {cap(c.capB)} market cap</span></span><span className="float-quote"><span>{c.price == null ? "Price unavailable" : c.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {c.cur}</span><span className={c.m6 != null && c.m6 < 0 ? "float-negative" : "float-positive"}>{c.m6 == null ? "—" : `${c.m6 >= 0 ? "+" : ""}${c.m6.toFixed(2)}%`} <small>6M</small></span></span><span className="float-mini-chart">{open !== c.ticker && <Chart company={c} />}<span className="float-expand" aria-label={open === c.ticker ? "Collapse chart" : "Enlarge chart"}>{open === c.ticker ? "−" : "+"}</span></span></span>
      </button>
      {open === c.ticker && <div className="float-detail" id={`detail-${c.ticker}`}><div className="float-detail-meta"><span>Six-month price history · {c.cur}</span><span>{c.rev == null ? "Revenue unavailable" : `${cap(c.rev / 1e9)} annual revenue`}</span></div><Chart company={c} large /><div className="float-detail-meta"><span>Mar 2026</span><span>Sep 2026</span></div><p className="float-muted">Historical reference snapshot. {top ? "Coverage reflects the source snapshot." : "Live trading and funding status are currently unavailable."}</p></div>}
    </article>)}</div>
    {!rows.length && <p className="h3 h3--small">No companies match “{query}”. <button onClick={() => { setQuery(""); setFilter("all"); }}>Reset filters</button></p>}
    <div className="float-list-footer"><span aria-live="polite">Showing {Math.min(limit, rows.length)} of {rows.length} companies</span>{limit < rows.length && <button onClick={() => setLimit(limit + 40)}>Show more ↓</button>}</div>
    {!top && <div className="float-notes AnnouncementsList_announcementsList__list__y5pZs"><article className="float-article"><header className="PostPreview_postPreview__header__Vumpb"><span className="h3 h3--small">Transparency</span></header><div className="PostPreview_postPreview__content__qwniW"><h2 className="h3 h3--medium">Proof of reserve</h2><p className="h3 h3--small">Shares held in custody against fSHARES outstanding, per market.</p><p className="float-muted">Reserve balances are unavailable while the Float market service is disconnected.</p></div></article><article className="float-article"><header className="PostPreview_postPreview__header__Vumpb"><span className="h3 h3--small">Infrastructure</span></header><div className="PostPreview_postPreview__content__qwniW"><h2 className="h3 h3--medium">Oracles</h2><p className="h3 h3--small">Reference prices with per-market staleness limits.</p>{[["Float updater", "Primary poster"], ["Chainlink", "Adapter"], ["RedStone", "Planned"], ["DIA", "Planned"], ["Pyth", "Awaiting deployment"]].map(([name, status]) => <div className="float-oracle" key={name}><span>{name}</span><span className="float-muted">{status}</span></div>)}<p className="float-muted">Source configuration; live feed health is unavailable.</p></div></article></div>}
    <p className="float-disclaimer">Source: Float’s September 1 snapshot. Prices retain their original reference currencies. Historical data and coverage may have changed.</p>
  </div>;
}
