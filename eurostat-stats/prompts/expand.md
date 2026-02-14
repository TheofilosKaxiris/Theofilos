# Eurostat Stats — Project Expansion Prompt

## Purpose

Transform the Eurostat Stats project from a simple chart viewer into **the best free tool for exploring, comparing, and understanding European statistics**. The target audience is journalists, students, researchers, and EU policy enthusiasts who need quick visual answers from Eurostat data without learning the API.

---

## Current State (What We Have)

- 3 static HTML pages: Overview, Economy, Tourism
- 2 JS modules: `main.js` (data fetching), `charts.js` (Chart.js line rendering)
- Users must paste raw Eurostat API URLs to get charts
- Hardcoded to 4 countries per dashboard page
- Line charts only, no export, no caching, no filtering UI
- Vanilla JS + Bootstrap 5 + Chart.js (CDN), no build step
- Monetized with Google AdSense, tracked with Google Analytics

---

## Expansion Goals

### 1. Make It Useful — Interactive Explorer (No More URL Pasting)

Replace the raw-URL workflow with a guided explorer UI:

- **Dataset Picker**: Searchable dropdown of all Eurostat datasets, grouped by theme (Economy, Tourism, Employment, Demographics, Environment, etc.). Fetch the table of contents from `https://ec.europa.eu/eurostat/api/dissemination/catalogue/toc` to keep it up to date.
- **Country Selector**: Multi-select with EU flags and names. Presets for "EU-27", "Eurozone", "Southern Europe", "Nordic", etc.
- **Time Range Slider**: Pick start/end year instead of editing URL parameters.
- **Dimension Filters**: Auto-detect available dimensions for the selected dataset and render dropdowns/checkboxes for each (unit, sector, age group, sex, etc.).
- **One-Click Fetch**: A single "Visualize" button that builds the Eurostat URL internally from the selections above.
- The raw URL input should still exist as an "Advanced" toggle for power users.

### 2. Make It Scalable — Modular Architecture

Refactor the codebase so adding a new thematic page takes minutes, not copy-paste:

- **Shared HTML partials**: Extract header, nav, footer, ad slots, and chart-card template into reusable components. Use a lightweight templating approach (e.g., Web Components, or a tiny JS template loader — no heavy frameworks).
- **Page config via JSON**: Each thematic page (economy, tourism, employment, demographics, environment) should be driven by a JSON config file:
  ```json
  {
    "id": "economy",
    "title": "Economy",
    "icon": "chart-line",
    "charts": [
      {
        "title": "GDP Per Capita",
        "dataset": "nama_10_pc",
        "defaultGeo": ["DE", "EL", "FR", "IT"],
        "defaultFilters": { "unit": "CLV10_EUR_HAB", "na_item": "B1GQ" },
        "chartType": "line"
      }
    ]
  }
  ```
- **Auto-generate pages**: A single `dashboard.html` template reads the config and renders the page dynamically, or a simple build script generates static HTML from configs.
- **Plugin-style chart types**: `charts.js` should export a registry of chart renderers (line, bar, grouped bar, stacked area, heatmap, scatter) so configs can declare `"chartType": "bar"`.

### 3. Make It Clean — Code Quality & DX

- **ES Modules**: Convert `main.js` and `charts.js` to ES modules (`import`/`export`). Add a lightweight bundler if needed (esbuild single-command build) or use native `<script type="module">`.
- **Error handling**: Show user-friendly error messages in the UI (dataset not found, network error, empty results). Replace silent `console.error` with visible toast/alert components.
- **Loading states**: Already have a spinner — extend it with skeleton loaders for the chart cards on initial page load.
- **Constants file**: Move API base URLs, default countries, color palettes, and dataset metadata to a `config.js` or `constants.js`.
- **Consistent naming**: Standardize element IDs, CSS classes (BEM or utility-first), and JS function signatures.
- **Linting**: Add an `.eslintrc` with a simple config (eslint:recommended). Add `prettier` for formatting.

### 4. New Feature: Comparison Mode

A dedicated `/compare.html` page (or section within the explorer):

- Pick 2-4 datasets and overlay them on a dual-axis chart.
- Example: "GDP per capita" vs "Unemployment rate" for Greece 2010-2024.
- Normalize values (index to base year = 100) so different-scale indicators are visually comparable.
- Correlation indicator: show a simple Pearson r when comparing two series.

### 5. New Feature: Country Profile Page

A `/country.html?geo=EL` page that shows a dashboard for a single country:

- Key indicators at a glance: GDP, population, unemployment, inflation, tourism arrivals.
- Sparkline mini-charts for each indicator.
- "How does this country compare?" — rank within EU-27 for each metric.
- Data sourced from a curated list of "headline" datasets.

### 6. New Feature: Data Table & Export

Below every chart, add:

- **Toggle to data table view**: Show the raw numbers in a sortable HTML table.
- **Download CSV**: Export the fetched data as a `.csv` file.
- **Download PNG**: Use Chart.js `toBase64Image()` to let users save charts as images.
- **Share link**: Generate a URL with query params encoding the current dataset + filters + countries, so users can share or bookmark specific views.

### 7. New Feature: Caching Layer

- Cache fetched Eurostat responses in `localStorage` or `sessionStorage` with a TTL (e.g., 24 hours).
- Show "Data last updated: {date}" from the Eurostat `updated` field.
- Add a "Refresh" button to force re-fetch.
- This drastically improves perceived performance and reduces API load.

### 8. New Feature: Indicator Descriptions & Context

- For each dataset, show a short plain-English explanation: "This dataset measures the number of nights tourists spent in hotels, campsites, and other accommodations, broken down by country."
- Source these from a `datasets.json` metadata file with fields: `code`, `name`, `description`, `source`, `updateFrequency`, `relatedDatasets`.
- Link to the official Eurostat metadata page for deeper documentation.

### 9. Accessibility & SEO

- Semantic HTML: `<main>`, `<article>`, `<nav>`, `<section>` with proper headings hierarchy.
- ARIA labels on interactive elements (chart canvases, buttons, dropdowns).
- `alt` text for chart images (auto-generated summary: "Line chart showing GDP per capita for DE, EL, FR, IT from 2010 to 2023").
- Open Graph meta tags per page for social sharing.
- Structured data (JSON-LD) for Dataset schema.org type.

### 10. New Thematic Pages to Add

Expand beyond Economy and Tourism with these new sections:

| Page | Key Datasets | Why It Matters |
|------|-------------|----------------|
| **Employment** | `lfsa_egan`, `lfsa_urgan`, `earn_ses_annual` | Labor market is a top search topic |
| **Demographics** | `demo_pjan`, `demo_mlexpec`, `demo_find` | Population trends drive policy debate |
| **Environment** | `env_air_gge`, `nrg_bal_c`, `env_wasgen` | Climate and energy are headline topics |
| **Education** | `educ_uoe_enrt`, `edat_lfse_03` | Education attainment comparisons |
| **Health** | `hlth_cd_asdr`, `hlth_rs_bdsrg` | Post-COVID health statistics interest |

---

## Implementation Order

**Phase 1 — Foundation (do first)**
1. Refactor to ES modules and create `config.js` with constants
2. Extract shared HTML components (header, nav, footer, chart card)
3. Create page config JSON schema and make dashboard pages data-driven
4. Add error handling with user-visible messages
5. Add caching layer (localStorage with TTL)

**Phase 2 — Core UX Upgrade**
6. Build the interactive Dataset Explorer (dataset picker, country selector, time range, dimension filters)
7. Add data table toggle + CSV/PNG export below each chart
8. Add shareable URL generation
9. Expand chart types (bar, stacked area)

**Phase 3 — Content Expansion**
10. Add Employment, Demographics, and Environment pages with curated configs
11. Create the Country Profile page
12. Add dataset descriptions and metadata from `datasets.json`
13. Add Education and Health pages

**Phase 4 — Polish**
14. Comparison mode (dual-axis, normalization)
15. Accessibility audit and fixes
16. SEO optimization (structured data, OG tags)
17. Performance audit (lazy-load charts below fold, debounce inputs)
18. Add linting and formatting configs

---

## Constraints

- **Stay static**: No backend server. Everything runs client-side with CDN libraries and the Eurostat API. This keeps hosting free (GitHub Pages).
- **No heavy frameworks**: Keep it vanilla JS or at most a micro-library. The current zero-build simplicity is a feature — preserve it where possible. If a build step is added, it should be a single `esbuild` command, not a webpack config maze.
- **Mobile-first**: Every new feature must work on mobile. Test at 375px width.
- **Progressive enhancement**: The site should render meaningful content even if JS fails (show dataset descriptions, navigation, static text).
- **Respect the API**: Eurostat's API has no auth but has rate limits. Cache aggressively. Never fire parallel requests for dozens of datasets on page load.

---

## Success Criteria

The expansion is successful when:

1. A user can go from "I want to see Greece's unemployment rate over time" to a chart in **under 10 seconds and 3 clicks** — without knowing anything about Eurostat's API.
2. Adding a new thematic page requires **editing one JSON config file** and nothing else.
3. Any chart can be **exported as CSV or PNG** and **shared via URL**.
4. The codebase has **zero duplicated HTML** across pages.
5. The site loads in **under 2 seconds** on a 4G connection.
6. Every page scores **90+ on Lighthouse** for Performance, Accessibility, and SEO.
