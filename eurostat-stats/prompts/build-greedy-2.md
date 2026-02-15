# Build Guide: Greedy Ideas Round 2 — Selected Features

This document provides step-by-step implementation instructions for the selected ideas from `expand-greedy-ideas-2.md`.

---

## Project Context

**Tech Stack:**
- Vanilla JavaScript (no framework)
- HTML5 + CSS3 + Bootstrap 5.3.3
- Chart.js for visualizations
- Eurostat API for data (client-side fetching)
- localStorage for caching (24-hour TTL)

**Key Files:**
- `js/config.js` — Dataset catalog, country lists, URL builder
- `js/main.js` — `fetchEurostatData()` for API calls
- `js/charts.js` — `renderEurostatChart()` for Chart.js rendering
- `js/ui.js` — UI utilities, signal feed, data processing
- `js/cache.js` — localStorage cache with TTL

**Existing Patterns to Reuse:**
- Data fetching: `fetchEurostatData(buildEurostatUrl(...))`
- Country lists: `CONFIG.countries` (30+ countries)
- Dataset catalog: `DATASETS` object (40+ datasets)
- Chart rendering: `renderEurostatChart(data, element, chart, options)`
- Color palette: `CONFIG.colors.palette` and `CONFIG.colors.getColor(index)`

---

## Idea 1: The Shame Index — Europe's Worst Performers

**What:** A page highlighting the countries with the worst stats in each category — bottom 3 in unemployment, GDP growth, emissions, etc.

**Assessment: WORTH IT — High impact, low effort**
- Effort: Min 1 day, Max 2 days
- Existing leaderboard/signal feed logic can be flipped (sort ascending instead of descending)
- All required datasets already in `DATASETS` catalog
- Reuses existing data fetching, charting, and UI patterns
- Main work: create new page, add sorting logic, apply "shame" styling

---

### Overview

Build a standalone page (`shame-index.html`) that fetches key datasets across categories and displays the bottom 3 performers for each metric. Red styling emphasizes negative performance. Shareable links allow social media engagement.

---

### Steps

#### 1. Add page entry to config

In `js/config.js`, add the new page to `CONFIG.pages`:

```javascript
{ id: 'shame', label: 'Shame Index', href: 'shame-index.html', icon: 'exclamation-triangle' },
```

#### 2. Create the HTML page

Create `shame-index.html` with the same structure as `dashboard.html`:

- Include standard `<head>` with Bootstrap CSS, style.css
- Include navigation header (copy from dashboard.html)
- Create main content area with category sections
- Include footer
- Include script files: config.js, cache.js, ui.js, charts.js, main.js

Basic structure:
```html
<main class="container py-4">
  <header class="text-center mb-5">
    <h1 class="display-5 fw-bold text-danger">The Shame Index</h1>
    <p class="lead text-muted">Europe's Worst Performers — Updated with Latest Data</p>
  </header>

  <div id="shame-categories">
    <!-- Categories rendered here by JavaScript -->
  </div>
</main>
```

#### 3. Define shame metrics per category

In the page's `<script>` block, define which datasets to use for each category:

```javascript
const SHAME_METRICS = {
  economy: [
    { dataset: 'nama_10_pc', label: 'GDP Per Capita', filters: { unit: 'CLV10_EUR_HAB', na_item: 'B1GQ' }, lowIsBad: true },
    { dataset: 'nama_10_gdp', label: 'GDP Growth', filters: { unit: 'CLV10_MEUR', na_item: 'B1GQ' }, lowIsBad: true, useYoY: true },
  ],
  employment: [
    { dataset: 'une_rt_a', label: 'Unemployment Rate', filters: { sex: 'T', age: 'Y15-74' }, lowIsBad: false },
    { dataset: 'lfsa_urgan', label: 'Youth Unemployment', filters: { sex: 'T', age: 'Y15-24' }, lowIsBad: false },
  ],
  environment: [
    { dataset: 'env_air_gge', label: 'Greenhouse Gas Emissions', filters: { airpol: 'GHG', src_crf: 'TOTXMEMONIA', unit: 'T_HAB' }, lowIsBad: false },
  ],
  demographics: [
    { dataset: 'demo_mlexpec', label: 'Life Expectancy', filters: { sex: 'T', age: 'Y_LT1' }, lowIsBad: true },
  ],
};
```

Note: `lowIsBad: true` means low values are bad (sort ascending, take top 3). `lowIsBad: false` means high values are bad (sort descending, take top 3).

#### 4. Implement data fetching and ranking

Create a function to fetch a dataset and extract bottom 3:

```javascript
async function fetchWorstPerformers(metricConfig, count = 3) {
  // Get all EU countries
  const allGeo = Object.keys(CONFIG.countries);

  // Build URL and fetch
  const url = buildEurostatUrl(metricConfig.dataset, allGeo, metricConfig.filters);
  const result = await fetchEurostatData(url);

  if (!result || !result.data || result.data.length === 0) {
    return { metric: metricConfig.label, error: 'No data available' };
  }

  // Group by country and get latest value
  const byCountry = {};
  for (const row of result.data) {
    if (!byCountry[row.geo] || row.time > byCountry[row.geo].time) {
      byCountry[row.geo] = row;
    }
  }

  // Calculate YoY change if needed
  if (metricConfig.useYoY) {
    // Get previous year values and compute change
    // ... (implementation details)
  }

  // Sort and take worst performers
  const sorted = Object.values(byCountry)
    .filter(row => row.value !== null && !isNaN(row.value))
    .sort((a, b) => {
      if (metricConfig.lowIsBad) {
        return a.value - b.value; // Lowest first (these are the worst)
      } else {
        return b.value - a.value; // Highest first (these are the worst)
      }
    });

  return {
    metric: metricConfig.label,
    dataset: metricConfig.dataset,
    unit: result.unitLabel || '',
    year: sorted[0]?.time || 'N/A',
    worst: sorted.slice(0, count).map(row => ({
      country: CONFIG.countries[row.geo] || row.geo,
      code: row.geo,
      value: row.value,
    })),
  };
}
```

#### 5. Create rendering function

```javascript
function renderShameCategory(categoryId, categoryLabel, metrics) {
  const container = document.getElementById('shame-categories');

  const section = document.createElement('section');
  section.className = 'mb-5';
  section.innerHTML = `
    <h2 class="h4 mb-4 text-uppercase text-muted">${categoryLabel}</h2>
    <div class="row g-4" id="shame-${categoryId}"></div>
  `;
  container.appendChild(section);

  const row = section.querySelector(`#shame-${categoryId}`);

  for (const metric of metrics) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
      <div class="card shame-card h-100">
        <div class="card-header bg-danger text-white">
          <h5 class="mb-0">${metric.metric}</h5>
          <small class="opacity-75">${metric.year} | ${metric.unit}</small>
        </div>
        <ul class="list-group list-group-flush">
          ${metric.worst.map((item, i) => `
            <li class="list-group-item d-flex justify-content-between align-items-center shame-item">
              <span>
                <span class="shame-rank">#${i + 1}</span>
                <span class="fi fi-${item.code.toLowerCase()} me-2"></span>
                ${item.country}
              </span>
              <span class="badge bg-danger rounded-pill">${formatValue(item.value, metric.unit)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    row.appendChild(card);
  }
}
```

#### 6. Add CSS for shame styling

Add to `css/style.css`:

```css
/* Shame Index Styles */
.shame-card {
  border: 2px solid var(--bs-danger);
  border-radius: var(--radius);
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.15);
  transition: transform var(--transition), box-shadow var(--transition);
}

.shame-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(220, 53, 69, 0.25);
}

.shame-rank {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: var(--bs-danger);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  margin-right: 0.5rem;
}

.shame-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(220, 53, 69, 0.1);
}

.shame-item:last-child {
  border-bottom: none;
}
```

#### 7. Initialize and load data

In the page's `<script>` block, add initialization:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const categories = {
    economy: 'Economy',
    employment: 'Employment',
    environment: 'Environment',
    demographics: 'Demographics',
  };

  for (const [catId, catLabel] of Object.entries(categories)) {
    const metricsConfig = SHAME_METRICS[catId];
    const results = await Promise.all(
      metricsConfig.map(m => fetchWorstPerformers(m))
    );
    renderShameCategory(catId, catLabel, results);
  }
});
```

#### 8. Add share functionality

Add a share button that copies the URL:

```javascript
function addShareButton() {
  const header = document.querySelector('header');
  const btn = document.createElement('button');
  btn.className = 'btn btn-outline-danger mt-3';
  btn.innerHTML = '<i class="bi bi-share"></i> Share This Shame';
  btn.onclick = () => {
    navigator.clipboard.writeText(window.location.href);
    UI.toast('Link copied! Share the shame.', 'success');
  };
  header.appendChild(btn);
}
```

---

### Keep It Clean

- All shame logic stays in `shame-index.html` — no changes to core files except config.js page entry
- Reuse existing `fetchEurostatData()` and `buildEurostatUrl()` — don't duplicate data fetching
- Style additions go in a dedicated section of `style.css` with comment header
- Country codes map to names via existing `CONFIG.countries`

---

### Watch Out For

- **Missing data**: Some countries may not have data for certain metrics. Filter out nulls before sorting.
- **Metric interpretation**: Ensure `lowIsBad` flag is correct for each metric. GDP = low is bad. Unemployment = high is bad.
- **API rate limits**: Loading 4+ datasets at once may hit Eurostat rate limits. Use cached data when available.
- **Year consistency**: Different datasets update at different times. Display the year for each metric.
- **Negative values**: Some metrics can be negative (GDP change). Ensure sorting handles negatives correctly.

---

## Idea 7: The "Will X Ever Catch Y?" Convergence Calculator

**What:** Pick two countries. The calculator projects when (or if) the lagging country will catch the leading one based on current growth rates.

**Assessment: WORTH IT — Medium impact, medium effort**
- Effort: Min 2 days, Max 3 days
- Requires new projection logic (CAGR calculation, forward projection)
- Chart.js can render projections with dashed lines
- Existing country picker pattern can be adapted for two-country selection
- Main work: CAGR calculation, projection algorithm, result visualization

---

### Overview

Build a calculator page (`catchup.html`) where users select two countries and a metric. The tool calculates each country's compound annual growth rate (CAGR) from the last 10 years, projects forward, and shows if/when the lagging country catches up.

---

### Steps

#### 1. Add page entry to config

In `js/config.js`, add the new page:

```javascript
{ id: 'catchup', label: 'Catch-Up Calculator', href: 'catchup.html', icon: 'arrow-up-right' },
```

#### 2. Create the HTML page structure

Create `catchup.html`:

```html
<main class="container py-4">
  <header class="text-center mb-5">
    <h1 class="display-5 fw-bold">Will They Ever Catch Up?</h1>
    <p class="lead text-muted">See when one country will overtake another — or if they never will</p>
  </header>

  <div class="row justify-content-center">
    <div class="col-lg-8">
      <!-- Country Pickers -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-5">
              <label class="form-label">Chasing Country</label>
              <select id="country-a" class="form-select">
                <!-- Options populated by JS -->
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end justify-content-center">
              <span class="h4 mb-2">vs</span>
            </div>
            <div class="col-md-5">
              <label class="form-label">Leading Country</label>
              <select id="country-b" class="form-select">
                <!-- Options populated by JS -->
              </select>
            </div>
          </div>

          <div class="mt-3">
            <label class="form-label">Metric</label>
            <select id="metric-select" class="form-select">
              <option value="nama_10_pc" data-filters='{"unit":"CLV10_EUR_HAB","na_item":"B1GQ"}'>GDP Per Capita</option>
              <option value="earn_mw_cur" data-filters='{"currency":"EUR"}'>Minimum Wage</option>
              <option value="sdg_08_10" data-filters='{"unit":"CLV10_EUR_HAB","na_item":"B1GQ"}'>Real GDP Per Capita</option>
            </select>
          </div>

          <button id="calculate-btn" class="btn btn-primary w-100 mt-4">
            Calculate Catch-Up
          </button>
        </div>
      </div>

      <!-- Results -->
      <div id="results" class="card d-none">
        <div class="card-body">
          <div id="result-summary" class="alert mb-4"></div>
          <canvas id="projection-chart" height="300"></canvas>
          <div id="result-details" class="mt-4"></div>
        </div>
      </div>
    </div>
  </div>
</main>
```

#### 3. Populate country dropdowns

```javascript
function populateCountryDropdowns() {
  const countryA = document.getElementById('country-a');
  const countryB = document.getElementById('country-b');

  // Filter to major EU countries for cleaner UX
  const countries = Object.entries(CONFIG.countries)
    .sort((a, b) => a[1].localeCompare(b[1]));

  for (const [code, name] of countries) {
    countryA.add(new Option(name, code));
    countryB.add(new Option(name, code));
  }

  // Set defaults (e.g., Poland chasing Germany)
  countryA.value = 'PL';
  countryB.value = 'DE';
}
```

#### 4. Implement CAGR calculation

```javascript
function calculateCAGR(startValue, endValue, years) {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return null;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

function getGrowthData(data, countryCode, yearsBack = 10) {
  // Filter to country and sort by year
  const countryData = data.data
    .filter(row => row.geo === countryCode && row.value !== null)
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));

  if (countryData.length < 2) return null;

  // Get last N years
  const recent = countryData.slice(-yearsBack);
  const startYear = recent[0].time;
  const endYear = recent[recent.length - 1].time;
  const startValue = Number(recent[0].value);
  const endValue = Number(recent[recent.length - 1].value);
  const yearSpan = Number(endYear) - Number(startYear);

  const cagr = calculateCAGR(startValue, endValue, yearSpan);

  return {
    startYear,
    endYear,
    startValue,
    endValue,
    cagr,
    historicalData: recent,
  };
}
```

#### 5. Implement projection logic

```javascript
function projectCatchUp(dataA, dataB, maxYears = 50) {
  if (!dataA || !dataB || dataA.cagr === null || dataB.cagr === null) {
    return { error: 'Insufficient data for projection' };
  }

  let valueA = dataA.endValue;
  let valueB = dataB.endValue;
  const startYear = Math.max(Number(dataA.endYear), Number(dataB.endYear));

  // Determine who is chasing whom
  const aIsChasing = valueA < valueB;

  // If growth rates don't favor catch-up, it will never happen
  if (aIsChasing && dataA.cagr <= dataB.cagr) {
    return {
      catchUpYear: null,
      message: 'At current growth rates, the gap will never close.',
      diverging: true,
      projectionYears: [],
    };
  }

  if (!aIsChasing && dataB.cagr <= dataA.cagr) {
    return {
      catchUpYear: null,
      message: 'At current growth rates, the gap will never close.',
      diverging: true,
      projectionYears: [],
    };
  }

  // Project forward
  const projectionYears = [];
  for (let y = 0; y <= maxYears; y++) {
    const year = startYear + y;
    projectionYears.push({
      year,
      valueA,
      valueB,
    });

    // Check for catch-up
    if (aIsChasing && valueA >= valueB) {
      return {
        catchUpYear: year,
        yearsToGo: y,
        message: `At current growth rates, catch-up happens in ${year} (${y} years from now).`,
        projectionYears,
      };
    }
    if (!aIsChasing && valueB >= valueA) {
      return {
        catchUpYear: year,
        yearsToGo: y,
        message: `At current growth rates, catch-up happens in ${year} (${y} years from now).`,
        projectionYears,
      };
    }

    // Grow for next year
    valueA *= (1 + dataA.cagr / 100);
    valueB *= (1 + dataB.cagr / 100);
  }

  // No catch-up within maxYears
  return {
    catchUpYear: null,
    message: `At current growth rates, catch-up would take more than ${maxYears} years.`,
    projectionYears,
  };
}
```

#### 6. Render projection chart

```javascript
function renderProjectionChart(dataA, dataB, projection, countryA, countryB) {
  const ctx = document.getElementById('projection-chart').getContext('2d');

  // Destroy existing chart if any
  if (window.projectionChart) {
    window.projectionChart.destroy();
  }

  // Combine historical and projected data
  const historicalYears = dataA.historicalData.map(d => d.time);
  const projectedYears = projection.projectionYears.map(d => d.year);
  const allYears = [...new Set([...historicalYears, ...projectedYears])].sort();

  // Historical data
  const historicalA = allYears.map(y => {
    const row = dataA.historicalData.find(d => d.time == y);
    return row ? Number(row.value) : null;
  });
  const historicalB = allYears.map(y => {
    const row = dataB.historicalData.find(d => d.time == y);
    return row ? Number(row.value) : null;
  });

  // Projected data (starts where historical ends)
  const projectedA = allYears.map(y => {
    const row = projection.projectionYears.find(d => d.year == y);
    return row ? row.valueA : null;
  });
  const projectedB = allYears.map(y => {
    const row = projection.projectionYears.find(d => d.year == y);
    return row ? row.valueB : null;
  });

  window.projectionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allYears,
      datasets: [
        {
          label: `${CONFIG.countries[countryA]} (Historical)`,
          data: historicalA,
          borderColor: CONFIG.colors.palette[0],
          backgroundColor: CONFIG.colors.palette[0] + '20',
          borderWidth: 2,
          fill: false,
        },
        {
          label: `${CONFIG.countries[countryA]} (Projected)`,
          data: projectedA,
          borderColor: CONFIG.colors.palette[0],
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
        },
        {
          label: `${CONFIG.countries[countryB]} (Historical)`,
          data: historicalB,
          borderColor: CONFIG.colors.palette[1],
          backgroundColor: CONFIG.colors.palette[1] + '20',
          borderWidth: 2,
          fill: false,
        },
        {
          label: `${CONFIG.countries[countryB]} (Projected)`,
          data: projectedB,
          borderColor: CONFIG.colors.palette[1],
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { position: 'top' },
        annotation: projection.catchUpYear ? {
          annotations: {
            catchUpLine: {
              type: 'line',
              xMin: projection.catchUpYear,
              xMax: projection.catchUpYear,
              borderColor: 'green',
              borderWidth: 2,
              label: {
                display: true,
                content: `Catch-up: ${projection.catchUpYear}`,
                position: 'start',
              },
            },
          },
        } : {},
      },
      scales: {
        y: { beginAtZero: false },
      },
    },
  });
}
```

#### 7. Wire up the calculate button

```javascript
document.getElementById('calculate-btn').addEventListener('click', async () => {
  const countryA = document.getElementById('country-a').value;
  const countryB = document.getElementById('country-b').value;
  const metricSelect = document.getElementById('metric-select');
  const dataset = metricSelect.value;
  const filters = JSON.parse(metricSelect.selectedOptions[0].dataset.filters);

  if (countryA === countryB) {
    UI.toast('Please select two different countries', 'warning');
    return;
  }

  // Show loading state
  document.getElementById('calculate-btn').disabled = true;
  document.getElementById('calculate-btn').textContent = 'Calculating...';

  try {
    // Fetch data for both countries
    const url = buildEurostatUrl(dataset, [countryA, countryB], filters);
    const result = await fetchEurostatData(url);

    // Calculate growth data
    const dataA = getGrowthData(result, countryA);
    const dataB = getGrowthData(result, countryB);

    // Project catch-up
    const projection = projectCatchUp(dataA, dataB);

    // Render results
    renderResults(dataA, dataB, projection, countryA, countryB);
    renderProjectionChart(dataA, dataB, projection, countryA, countryB);

    document.getElementById('results').classList.remove('d-none');
  } catch (error) {
    UI.toast('Error fetching data: ' + error.message, 'error');
  } finally {
    document.getElementById('calculate-btn').disabled = false;
    document.getElementById('calculate-btn').textContent = 'Calculate Catch-Up';
  }
});

function renderResults(dataA, dataB, projection, countryA, countryB) {
  const summary = document.getElementById('result-summary');
  const details = document.getElementById('result-details');

  // Summary message
  if (projection.catchUpYear) {
    summary.className = 'alert alert-success';
    summary.innerHTML = `<strong>${CONFIG.countries[countryA]}</strong> will catch <strong>${CONFIG.countries[countryB]}</strong> by <strong>${projection.catchUpYear}</strong> (${projection.yearsToGo} years)`;
  } else if (projection.diverging) {
    summary.className = 'alert alert-danger';
    summary.innerHTML = `At current growth rates, <strong>${CONFIG.countries[countryA]}</strong> will <strong>never</strong> catch <strong>${CONFIG.countries[countryB]}</strong>. The gap is widening.`;
  } else {
    summary.className = 'alert alert-warning';
    summary.innerHTML = projection.message;
  }

  // Details table
  details.innerHTML = `
    <table class="table table-sm">
      <thead>
        <tr><th>Metric</th><th>${CONFIG.countries[countryA]}</th><th>${CONFIG.countries[countryB]}</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Latest Value (${dataA.endYear})</td>
          <td>${dataA.endValue.toLocaleString()}</td>
          <td>${dataB.endValue.toLocaleString()}</td>
        </tr>
        <tr>
          <td>10-Year CAGR</td>
          <td>${dataA.cagr.toFixed(2)}%</td>
          <td>${dataB.cagr.toFixed(2)}%</td>
        </tr>
        <tr>
          <td>Current Gap</td>
          <td colspan="2">${Math.abs(dataA.endValue - dataB.endValue).toLocaleString()} (${((Math.abs(dataA.endValue - dataB.endValue) / Math.max(dataA.endValue, dataB.endValue)) * 100).toFixed(1)}%)</td>
        </tr>
      </tbody>
    </table>
  `;
}
```

#### 8. Add share functionality

```javascript
function generateShareUrl(countryA, countryB, dataset) {
  const params = new URLSearchParams({
    a: countryA,
    b: countryB,
    m: dataset,
  });
  return `${window.location.origin}${window.location.pathname}?${params}`;
}

// Add share button to results
function addShareButton(countryA, countryB, dataset) {
  const shareUrl = generateShareUrl(countryA, countryB, dataset);
  const btn = document.createElement('button');
  btn.className = 'btn btn-outline-primary mt-3';
  btn.innerHTML = '<i class="bi bi-share"></i> Share This Projection';
  btn.onclick = () => {
    navigator.clipboard.writeText(shareUrl);
    UI.toast('Link copied!', 'success');
  };
  document.getElementById('result-details').appendChild(btn);
}

// On page load, check for URL params and auto-calculate
document.addEventListener('DOMContentLoaded', () => {
  populateCountryDropdowns();

  const params = new URLSearchParams(window.location.search);
  if (params.has('a') && params.has('b')) {
    document.getElementById('country-a').value = params.get('a');
    document.getElementById('country-b').value = params.get('b');
    if (params.has('m')) {
      document.getElementById('metric-select').value = params.get('m');
    }
    document.getElementById('calculate-btn').click();
  }
});
```

---

### Keep It Clean

- All calculator logic stays in `catchup.html` — minimal changes to core files
- CAGR calculation is a pure function, easy to test and reuse
- Projection logic handles edge cases (same country, diverging growth rates)
- Chart rendering reuses existing Chart.js patterns from `charts.js`
- URL state allows deep linking and sharing

---

### Watch Out For

- **Negative or zero values**: CAGR formula breaks with non-positive values. Add validation.
- **Missing data years**: Some countries have gaps. Use the years that exist, not assumed ranges.
- **Wildly different metrics**: GDP and population have different scales. Don't mix them.
- **Overly optimistic projections**: CAGR assumes constant growth, which is unrealistic over 50 years. Add a disclaimer.
- **API rate limits**: Fetching multiple countries/years may trigger limits. Use caching.
- **Chart performance**: Don't project too many years (50 is reasonable max).
- **Edge case — already ahead**: If country A is already ahead of B, the "catch-up" language is confusing. Swap the framing.

---

## Summary

| Feature | Effort | Status |
|---------|--------|--------|
| Shame Index | 1-2 days | WORTH IT |
| Catch-Up Calculator | 2-3 days | WORTH IT |

Both features build on existing patterns and add high-engagement content with relatively low effort. The Shame Index is faster to build (mostly data sorting + red styling), while the Catch-Up Calculator requires more new logic but creates a genuinely useful interactive tool.
