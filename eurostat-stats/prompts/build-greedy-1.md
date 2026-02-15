# Implementation Guide: Greedy Ideas Build 1

This guide provides step-by-step implementation instructions for selected features from the Eurostat Statistics Explorer greedy ideas list.

**Selected Ideas:** #2 EU Report Card, #7 EU Leaderboard

**Project Context:**
- Pure client-side static site (HTML/CSS/vanilla JS)
- Chart.js for visualizations
- Bootstrap 5 for styling
- Eurostat REST API for data
- localStorage for caching (24hr TTL)
- No build tools required — edit files directly

---

## Idea #2: EU Report Card

### Assessment: WORTH IT — High impact, Low-Medium effort

**What:** Every country gets a letter grade (A+ to F) for each category (Economy, Environment, Employment, Demographics, Tourism) based on their metrics vs EU average.

- **Effort:** Min 1 day, Max 2 days
- **Existing infrastructure:**
  - `CONFIG.pageConfigs` already groups datasets by category (economy, tourism, employment, demographics, environment)
  - `DATASETS` catalog has 40+ datasets with metadata
  - `fetchEurostatData()` handles API calls with caching
  - `CONFIG.countries` has full EU country list with names/flags
  - UI patterns for cards and toasts already established
- **Technical approach:** Create a new `report-card.html` page that fetches key metrics per category, calculates percentile rankings vs EU27, and maps to letter grades
- **Main constraint:** Eurostat API calls are per-dataset, so we need to batch multiple fetches — use existing cache to minimize API load
- **What makes this easier:** Only need 1-2 key metrics per category for MVP; grading logic is simple math (percentile → grade mapping)

---

### Overview

We're building a country report card that shows letter grades (A+ to F) for each of the five categories, based on how a country performs relative to the EU average. Users select a country from a dropdown and instantly see a visual report card they can screenshot and share.

---

### Steps

#### 1. Create the report card page file

Create `report-card.html` in the project root, using the same structure as `dashboard.html`:

```
eurostat-stats/
├── report-card.html  ← NEW FILE
├── index.html
├── dashboard.html
└── ...
```

Copy the boilerplate from `index.html` (head, nav, footer, script includes) but replace the main content area.

#### 2. Add report card to navigation

In `js/config.js`, add the report card page to the `CONFIG.pages` array:

```javascript
pages: [
    { id: 'index',        label: 'Explorer',     href: 'index.html',               icon: 'search' },
    { id: 'report-card',  label: 'Report Card',  href: 'report-card.html',         icon: 'clipboard' },  // ADD THIS
    { id: 'economy',      label: 'Economy',      href: 'dashboard.html?page=economy',      icon: 'chart-line' },
    // ... rest unchanged
],
```

#### 3. Define report card metrics configuration

Add a new config section in `js/config.js` for report card metrics — pick one representative dataset per category:

```javascript
reportCard: {
    metrics: {
        economy: {
            dataset: 'tec00114',  // GDP per capita in PPS (EU27=100)
            label: 'GDP per Capita',
            higherIsBetter: true,
            filters: {},
        },
        employment: {
            dataset: 'une_rt_a',  // Unemployment rate
            label: 'Employment',
            higherIsBetter: false,  // Lower unemployment = better
            filters: { sex: 'T', age: 'Y15-74', unit: 'PC_ACT' },
        },
        environment: {
            dataset: 'nrg_ind_ren',  // Renewable energy share
            label: 'Environment',
            higherIsBetter: true,
            filters: { nrg_bal: 'REN', unit: 'PC' },
        },
        demographics: {
            dataset: 'demo_mlexpec',  // Life expectancy
            label: 'Demographics',
            higherIsBetter: true,
            filters: { sex: 'T', age: 'Y_LT1' },
        },
        tourism: {
            dataset: 'tour_occ_ninat',  // Tourist nights
            label: 'Tourism',
            higherIsBetter: true,
            filters: { unit: 'NR', c_resid: 'TOTAL', nace_r2: 'I551' },
        },
    },
    // Grade thresholds (percentile-based)
    gradeThresholds: [
        { grade: 'A+', minPercentile: 95 },
        { grade: 'A',  minPercentile: 85 },
        { grade: 'A-', minPercentile: 75 },
        { grade: 'B+', minPercentile: 65 },
        { grade: 'B',  minPercentile: 55 },
        { grade: 'B-', minPercentile: 45 },
        { grade: 'C+', minPercentile: 35 },
        { grade: 'C',  minPercentile: 25 },
        { grade: 'C-', minPercentile: 15 },
        { grade: 'D',  minPercentile: 5 },
        { grade: 'F',  minPercentile: 0 },
    ],
},
```

#### 4. Build the HTML structure for report-card.html

The page needs:
- Country selector dropdown
- Five grade cards (one per category)
- Share button
- Loading state

```html
<main class="col-12 col-lg-8 d-flex flex-column align-items-center py-3">
    <section class="card w-100 my-2">
        <div class="card-body">
            <h2>EU Report Card</h2>
            <p class="text-muted mb-3">See how any EU country grades across Economy, Employment, Environment, Demographics, and Tourism.</p>

            <div class="mb-4">
                <label for="countrySelect" class="form-label">Select a Country</label>
                <select id="countrySelect" class="form-select" style="max-width: 300px;"></select>
            </div>

            <div id="reportCardContainer" style="display: none;">
                <div class="report-card-grid" id="gradeCards">
                    <!-- Grade cards inserted by JS -->
                </div>
                <div class="mt-4 d-flex gap-2">
                    <button class="btn-action" id="shareReportCard">Share Report Card</button>
                    <button class="btn-action" id="downloadReportCard">Download PNG</button>
                </div>
            </div>

            <div id="loadingState" style="display: none;">
                <div class="loading-spinner"></div>
                <p class="text-muted mt-2">Fetching latest data from Eurostat...</p>
            </div>
        </div>
    </section>
</main>
```

#### 5. Add report card CSS styles

Add to `css/style.css`:

```css
/* Report Card Styles */
.report-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
}

.grade-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem 1rem;
    text-align: center;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.grade-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.grade-card .category-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
}

.grade-card .grade {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
}

.grade-card .grade-detail {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

/* Grade colors */
.grade-a { color: #16a34a; }      /* Green for A grades */
.grade-b { color: #2563eb; }      /* Blue for B grades */
.grade-c { color: #eab308; }      /* Yellow for C grades */
.grade-d { color: #f97316; }      /* Orange for D */
.grade-f { color: #dc2626; }      /* Red for F */
```

#### 6. Implement the report card JavaScript logic

Add a new script block in `report-card.html` (after including config.js, cache.js, ui.js):

```javascript
// ── Report Card State ─────────────────────────
var reportState = {
    selectedCountry: null,
    grades: {},
    rawData: {},
};

// ── Populate Country Dropdown ─────────────────
var countrySelect = document.getElementById('countrySelect');
(function buildCountryDropdown() {
    var codes = Object.keys(CONFIG.countries)
        .filter(function(c) { return c !== 'EU27_2020' && c !== 'EA20'; })
        .sort(function(a, b) { return CONFIG.countries[a].localeCompare(CONFIG.countries[b]); });

    var html = '<option value="">Choose a country...</option>';
    for (var i = 0; i < codes.length; i++) {
        html += '<option value="' + codes[i] + '">' + CONFIG.countries[codes[i]] + ' (' + codes[i] + ')</option>';
    }
    countrySelect.innerHTML = html;
})();

// ── Grade Calculation ─────────────────────────
function calculatePercentile(value, allValues, higherIsBetter) {
    var sorted = allValues.slice().sort(function(a, b) { return a - b; });
    var rank = sorted.indexOf(value);
    var percentile = (rank / (sorted.length - 1)) * 100;
    return higherIsBetter ? percentile : (100 - percentile);
}

function percentileToGrade(percentile) {
    var thresholds = CONFIG.reportCard.gradeThresholds;
    for (var i = 0; i < thresholds.length; i++) {
        if (percentile >= thresholds[i].minPercentile) {
            return thresholds[i].grade;
        }
    }
    return 'F';
}

function getGradeClass(grade) {
    if (grade.startsWith('A')) return 'grade-a';
    if (grade.startsWith('B')) return 'grade-b';
    if (grade.startsWith('C')) return 'grade-c';
    if (grade === 'D') return 'grade-d';
    return 'grade-f';
}

// ── Fetch and Grade ───────────────────────────
async function fetchReportCard(countryCode) {
    var metrics = CONFIG.reportCard.metrics;
    var categories = Object.keys(metrics);
    var allCountries = Object.keys(CONFIG.countries).filter(function(c) {
        return c !== 'EU27_2020' && c !== 'EA20';
    });

    reportState.grades = {};
    reportState.rawData = {};

    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var cfg = metrics[cat];
        var url = buildEurostatUrl(cfg.dataset, allCountries, cfg.filters);

        try {
            var data = await fetchEurostatData(url);
            if (!data || !data.data) continue;

            // Get most recent year's data for each country
            var latestByCountry = {};
            for (var j = 0; j < data.data.length; j++) {
                var row = data.data[j];
                var geoCode = row.geoCode || row.geo;
                if (!latestByCountry[geoCode] || row.time > latestByCountry[geoCode].time) {
                    latestByCountry[geoCode] = row;
                }
            }

            var allValues = Object.values(latestByCountry)
                .map(function(r) { return Number(r.value); })
                .filter(function(v) { return isFinite(v); });

            var countryData = latestByCountry[countryCode];
            if (countryData && isFinite(Number(countryData.value))) {
                var value = Number(countryData.value);
                var percentile = calculatePercentile(value, allValues, cfg.higherIsBetter);
                var grade = percentileToGrade(percentile);

                reportState.grades[cat] = {
                    grade: grade,
                    value: value,
                    percentile: percentile,
                    year: countryData.time,
                };
                reportState.rawData[cat] = data;
            }
        } catch (err) {
            console.error('Failed to fetch ' + cat + ':', err);
        }
    }
}

// ── Render Grade Cards ────────────────────────
function renderGradeCards() {
    var container = document.getElementById('gradeCards');
    var metrics = CONFIG.reportCard.metrics;
    var categories = Object.keys(metrics);
    var html = '';

    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var gradeInfo = reportState.grades[cat];
        var label = metrics[cat].label;

        if (gradeInfo) {
            html += '<div class="grade-card">' +
                '<div class="category-label">' + UI._esc(label) + '</div>' +
                '<div class="grade ' + getGradeClass(gradeInfo.grade) + '">' + gradeInfo.grade + '</div>' +
                '<div class="grade-detail">' + gradeInfo.value.toLocaleString() + ' (' + gradeInfo.year + ')</div>' +
            '</div>';
        } else {
            html += '<div class="grade-card">' +
                '<div class="category-label">' + UI._esc(label) + '</div>' +
                '<div class="grade" style="color: #9ca3af;">N/A</div>' +
                '<div class="grade-detail">No data available</div>' +
            '</div>';
        }
    }

    container.innerHTML = html;
}

// ── Event Handlers ────────────────────────────
countrySelect.addEventListener('change', async function() {
    var code = this.value;
    if (!code) {
        document.getElementById('reportCardContainer').style.display = 'none';
        return;
    }

    reportState.selectedCountry = code;
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('reportCardContainer').style.display = 'none';

    await fetchReportCard(code);

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('reportCardContainer').style.display = 'block';
    renderGradeCards();

    // Update URL for sharing
    var params = new URLSearchParams();
    params.set('country', code);
    window.history.replaceState({}, '', window.location.pathname + '?' + params.toString());
});

document.getElementById('shareReportCard').addEventListener('click', function() {
    if (!reportState.selectedCountry) return;
    var url = window.location.origin + window.location.pathname + '?country=' + reportState.selectedCountry;
    navigator.clipboard.writeText(url).then(function() {
        UI.toast('Report card link copied!', 'success');
    });
});

// ── Handle URL params on load ─────────────────
(function handleShareUrl() {
    var params = new URLSearchParams(window.location.search);
    var country = params.get('country');
    if (country && CONFIG.countries[country]) {
        countrySelect.value = country;
        countrySelect.dispatchEvent(new Event('change'));
    }
})();
```

#### 7. Add summary text generation

After `renderGradeCards()`, add a summary generator for social sharing:

```javascript
function buildShareSummary() {
    if (!reportState.selectedCountry) return '';
    var countryName = CONFIG.countries[reportState.selectedCountry] || reportState.selectedCountry;
    var grades = reportState.grades;
    var parts = [];

    var order = ['economy', 'employment', 'environment', 'demographics', 'tourism'];
    var labels = { economy: 'Economy', employment: 'Employment', environment: 'Environment', demographics: 'Demographics', tourism: 'Tourism' };

    for (var i = 0; i < order.length; i++) {
        var cat = order[i];
        if (grades[cat]) {
            parts.push(labels[cat] + ' ' + grades[cat].grade);
        }
    }

    return countryName + "'s EU Report Card: " + parts.join(', ');
}
```

---

### Keep It Clean

- **No new dependencies:** Uses existing Chart.js, Bootstrap, and vanilla JS patterns
- **Follows established patterns:** Same card structure, toast notifications, URL sharing as existing pages
- **Config-driven:** All metrics defined in `CONFIG.reportCard` — easy to add/change metrics later
- **Caching leveraged:** Uses existing `fetchEurostatData()` which caches for 24 hours
- **Responsive:** Grid layout works on mobile

### Watch Out For

- **Missing data:** Some countries may not have data for all metrics — show "N/A" gracefully
- **Data staleness:** Different datasets update at different frequencies — show the year in the grade detail
- **API rate limits:** Fetching 5 datasets × 27 countries = high API load — caching is essential
- **Edge case:** If a country has extreme outlier values, percentile calculation still works but grades may seem unfair (e.g., Luxembourg GDP)

---

## Idea #7: EU Leaderboard

### Assessment: WORTH IT — High impact, Low effort

**What:** Real-time leaderboards ranking all EU countries across every metric. GDP leaderboard, Unemployment leaderboard, Green energy leaderboard, etc.

- **Effort:** Min 0.5 days, Max 1 day
- **Existing infrastructure:**
  - `DATASETS` already categorized with all needed metadata
  - `fetchEurostatData()` fetches all countries in one call
  - `CONFIG.countries` has full country list with names for display
  - `UI.dataTableHTML()` shows how to render sortable tables
- **Technical approach:** New `leaderboard.html` page with dataset selector; fetch data, sort by latest values, display ranked table with flags
- **Main constraint:** Need flag emojis or images for visual appeal — use Unicode flag emojis (🇩🇪, 🇫🇷, etc.)
- **What makes this easier:** This is essentially a sorted table view of existing data — minimal new logic needed

---

### Overview

We're building a leaderboard page where users pick any metric and see all EU countries ranked from best to worst. The table shows rank, country flag/name, value, and change indicator (↑↓→). Users can share the URL to link to specific leaderboards.

---

### Steps

#### 1. Create the leaderboard page file

Create `leaderboard.html` in the project root:

```
eurostat-stats/
├── leaderboard.html  ← NEW FILE
├── report-card.html
├── index.html
└── ...
```

#### 2. Add leaderboard to navigation

In `js/config.js`, add to `CONFIG.pages`:

```javascript
pages: [
    { id: 'index',        label: 'Explorer',     href: 'index.html',               icon: 'search' },
    { id: 'report-card',  label: 'Report Card',  href: 'report-card.html',         icon: 'clipboard' },
    { id: 'leaderboard',  label: 'Leaderboard',  href: 'leaderboard.html',         icon: 'trophy' },  // ADD THIS
    { id: 'economy',      label: 'Economy',      href: 'dashboard.html?page=economy',      icon: 'chart-line' },
    // ... rest unchanged
],
```

#### 3. Add country flag emoji helper

Add to `js/config.js`:

```javascript
// Convert country code to flag emoji
countryFlags: {
    AT: '🇦🇹', BE: '🇧🇪', BG: '🇧🇬', CY: '🇨🇾', CZ: '🇨🇿',
    DE: '🇩🇪', DK: '🇩🇰', EE: '🇪🇪', EL: '🇬🇷', ES: '🇪🇸',
    FI: '🇫🇮', FR: '🇫🇷', HR: '🇭🇷', HU: '🇭🇺', IE: '🇮🇪',
    IT: '🇮🇹', LT: '🇱🇹', LU: '🇱🇺', LV: '🇱🇻', MT: '🇲🇹',
    NL: '🇳🇱', PL: '🇵🇱', PT: '🇵🇹', RO: '🇷🇴', SE: '🇸🇪',
    SI: '🇸🇮', SK: '🇸🇰', NO: '🇳🇴', IS: '🇮🇸', CH: '🇨🇭',
},

getFlag: function(code) {
    return this.countryFlags[code] || '';
},
```

#### 4. Define popular leaderboard presets

Add to `js/config.js`:

```javascript
leaderboardPresets: [
    { dataset: 'tec00114', label: 'GDP per Capita (PPS)', higherIsBetter: true, filters: {} },
    { dataset: 'une_rt_a', label: 'Unemployment Rate', higherIsBetter: false, filters: { sex: 'T', age: 'Y15-74', unit: 'PC_ACT' } },
    { dataset: 'nrg_ind_ren', label: 'Renewable Energy %', higherIsBetter: true, filters: { nrg_bal: 'REN', unit: 'PC' } },
    { dataset: 'demo_mlexpec', label: 'Life Expectancy', higherIsBetter: true, filters: { sex: 'T', age: 'Y_LT1' } },
    { dataset: 'tec00118', label: 'Inflation Rate', higherIsBetter: false, filters: {} },
],
```

#### 5. Build the HTML structure for leaderboard.html

```html
<main class="col-12 col-lg-8 d-flex flex-column align-items-center py-3">
    <section class="card w-100 my-2">
        <div class="card-body">
            <h2>EU Leaderboard</h2>
            <p class="text-muted mb-3">See how EU countries rank on any metric. Click column headers to sort.</p>

            <!-- Quick preset buttons -->
            <div class="leaderboard-presets mb-3" id="presetButtons"></div>

            <!-- Or search any dataset -->
            <div class="mb-4">
                <label for="datasetSelect" class="form-label">Or choose any dataset</label>
                <select id="datasetSelect" class="form-select" style="max-width: 400px;"></select>
            </div>

            <div id="leaderboardContainer" style="display: none;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h3 id="leaderboardTitle" class="h5 mb-0"></h3>
                    <span class="text-muted" id="leaderboardUpdated"></span>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover leaderboard-table" id="leaderboardTable">
                        <thead>
                            <tr>
                                <th style="width: 60px;">#</th>
                                <th>Country</th>
                                <th class="text-end">Value</th>
                                <th class="text-center" style="width: 60px;">YoY</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboardBody"></tbody>
                    </table>
                </div>
                <div class="mt-3">
                    <button class="btn-action" id="shareLeaderboard">Share This Leaderboard</button>
                </div>
            </div>

            <div id="loadingState" style="display: none;">
                <div class="loading-spinner"></div>
            </div>
        </div>
    </section>
</main>
```

#### 6. Add leaderboard CSS styles

Add to `css/style.css`:

```css
/* Leaderboard Styles */
.leaderboard-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.leaderboard-presets .btn-preset {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.leaderboard-table {
    margin-bottom: 0;
}

.leaderboard-table th {
    background: var(--surface);
    position: sticky;
    top: 0;
    cursor: pointer;
    user-select: none;
}

.leaderboard-table th:hover {
    background: var(--border);
}

.leaderboard-table .rank-cell {
    font-weight: 600;
    color: var(--text-secondary);
}

.leaderboard-table .rank-1 { color: #eab308; }  /* Gold */
.leaderboard-table .rank-2 { color: #9ca3af; }  /* Silver */
.leaderboard-table .rank-3 { color: #b45309; }  /* Bronze */

.leaderboard-table .country-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.leaderboard-table .flag {
    font-size: 1.25rem;
}

.leaderboard-table .yoy-up { color: #16a34a; }
.leaderboard-table .yoy-down { color: #dc2626; }
.leaderboard-table .yoy-flat { color: #9ca3af; }
```

#### 7. Implement the leaderboard JavaScript logic

Add script block in `leaderboard.html`:

```javascript
// ── Leaderboard State ─────────────────────────
var leaderboardState = {
    currentDataset: null,
    currentFilters: {},
    higherIsBetter: true,
    data: null,
    sortColumn: 'rank',
    sortAsc: true,
};

// ── Build Preset Buttons ──────────────────────
(function buildPresets() {
    var container = document.getElementById('presetButtons');
    var presets = CONFIG.leaderboardPresets || [];
    var html = '';
    for (var i = 0; i < presets.length; i++) {
        var p = presets[i];
        html += '<button class="btn-preset" data-dataset="' + p.dataset + '" ' +
            'data-filters=\'' + JSON.stringify(p.filters) + '\' ' +
            'data-higher="' + p.higherIsBetter + '">' + UI._esc(p.label) + '</button>';
    }
    container.innerHTML = html;
})();

// ── Build Dataset Dropdown ────────────────────
(function buildDatasetDropdown() {
    var select = document.getElementById('datasetSelect');
    var groups = getDatasetsByCategory();
    var html = '<option value="">Select a dataset...</option>';
    var cats = Object.keys(groups).sort();

    for (var i = 0; i < cats.length; i++) {
        html += '<optgroup label="' + UI._esc(cats[i]) + '">';
        var datasets = groups[cats[i]];
        for (var j = 0; j < datasets.length; j++) {
            html += '<option value="' + datasets[j].code + '">' + UI._esc(datasets[j].name) + '</option>';
        }
        html += '</optgroup>';
    }
    select.innerHTML = html;
})();

// ── Fetch and Rank ────────────────────────────
async function fetchLeaderboard(datasetCode, filters, higherIsBetter) {
    var allCountries = Object.keys(CONFIG.countries).filter(function(c) {
        return c !== 'EU27_2020' && c !== 'EA20';
    });

    var url = buildEurostatUrl(datasetCode, allCountries, filters);
    var data = await fetchEurostatData(url);

    if (!data || !data.data) return null;

    // Get most recent value for each country
    var latestByCountry = {};
    var prevByCountry = {};

    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        var code = row.geoCode || row.geo;
        if (!latestByCountry[code] || row.time > latestByCountry[code].time) {
            prevByCountry[code] = latestByCountry[code];
            latestByCountry[code] = row;
        } else if (!prevByCountry[code] || row.time > prevByCountry[code].time) {
            prevByCountry[code] = row;
        }
    }

    // Build ranked array
    var ranked = [];
    for (var code in latestByCountry) {
        if (!latestByCountry.hasOwnProperty(code)) continue;
        if (!CONFIG.countries[code]) continue;  // Skip non-EU countries

        var latest = latestByCountry[code];
        var prev = prevByCountry[code];
        var value = Number(latest.value);
        if (!isFinite(value)) continue;

        var yoy = null;
        if (prev && isFinite(Number(prev.value)) && Number(prev.value) !== 0) {
            yoy = ((value - Number(prev.value)) / Math.abs(Number(prev.value))) * 100;
        }

        ranked.push({
            code: code,
            name: CONFIG.countries[code],
            flag: CONFIG.getFlag(code),
            value: value,
            year: latest.time,
            yoy: yoy,
        });
    }

    // Sort by value
    ranked.sort(function(a, b) {
        return higherIsBetter ? (b.value - a.value) : (a.value - b.value);
    });

    // Assign ranks
    for (var i = 0; i < ranked.length; i++) {
        ranked[i].rank = i + 1;
    }

    return { ranked: ranked, updated: data.updated, label: data.label || data.preferredLabel };
}

// ── Render Leaderboard Table ──────────────────
function renderLeaderboard() {
    var data = leaderboardState.data;
    if (!data) return;

    var tbody = document.getElementById('leaderboardBody');
    var html = '';

    for (var i = 0; i < data.ranked.length; i++) {
        var row = data.ranked[i];
        var rankClass = row.rank <= 3 ? 'rank-' + row.rank : '';
        var yoyClass = row.yoy > 0.5 ? 'yoy-up' : (row.yoy < -0.5 ? 'yoy-down' : 'yoy-flat');
        var yoySymbol = row.yoy > 0.5 ? '↑' : (row.yoy < -0.5 ? '↓' : '→');
        var yoyText = row.yoy !== null ? (row.yoy >= 0 ? '+' : '') + row.yoy.toFixed(1) + '%' : '-';

        html += '<tr>' +
            '<td class="rank-cell ' + rankClass + '">' + row.rank + '</td>' +
            '<td class="country-cell"><span class="flag">' + row.flag + '</span> ' + UI._esc(row.name) + '</td>' +
            '<td class="text-end">' + row.value.toLocaleString() + '</td>' +
            '<td class="text-center ' + yoyClass + '" title="' + yoyText + '">' + yoySymbol + '</td>' +
        '</tr>';
    }

    tbody.innerHTML = html;
    document.getElementById('leaderboardTitle').textContent = data.label || DATASETS[leaderboardState.currentDataset]?.name || 'Leaderboard';
    document.getElementById('leaderboardUpdated').textContent = data.updated ? 'Updated: ' + data.updated : '';
}

// ── Event Handlers ────────────────────────────
document.getElementById('presetButtons').addEventListener('click', async function(e) {
    var btn = e.target.closest('.btn-preset');
    if (!btn) return;

    var dataset = btn.dataset.dataset;
    var filters = JSON.parse(btn.dataset.filters || '{}');
    var higher = btn.dataset.higher === 'true';

    await loadLeaderboard(dataset, filters, higher);
});

document.getElementById('datasetSelect').addEventListener('change', async function() {
    var dataset = this.value;
    if (!dataset) return;

    var meta = DATASETS[dataset];
    var filters = meta ? meta.defaultFilters : {};

    await loadLeaderboard(dataset, filters, true);
});

async function loadLeaderboard(dataset, filters, higherIsBetter) {
    leaderboardState.currentDataset = dataset;
    leaderboardState.currentFilters = filters;
    leaderboardState.higherIsBetter = higherIsBetter;

    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('leaderboardContainer').style.display = 'none';

    leaderboardState.data = await fetchLeaderboard(dataset, filters, higherIsBetter);

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('leaderboardContainer').style.display = 'block';
    renderLeaderboard();

    // Update URL
    var params = new URLSearchParams();
    params.set('dataset', dataset);
    if (Object.keys(filters).length) {
        params.set('filters', JSON.stringify(filters));
    }
    params.set('order', higherIsBetter ? 'desc' : 'asc');
    window.history.replaceState({}, '', window.location.pathname + '?' + params.toString());
}

document.getElementById('shareLeaderboard').addEventListener('click', function() {
    navigator.clipboard.writeText(window.location.href).then(function() {
        UI.toast('Leaderboard link copied!', 'success');
    });
});

// ── Handle URL params on load ─────────────────
(function handleShareUrl() {
    var params = new URLSearchParams(window.location.search);
    var dataset = params.get('dataset');
    if (dataset && DATASETS[dataset]) {
        var filters = {};
        try { filters = JSON.parse(params.get('filters') || '{}'); } catch(e) {}
        var higher = params.get('order') !== 'asc';
        loadLeaderboard(dataset, filters, higher);
    }
})();
```

---

### Keep It Clean

- **Reuses existing data layer:** `buildEurostatUrl()` and `fetchEurostatData()` handle all API complexity
- **Config-driven presets:** Popular leaderboards defined in config for easy updates
- **Follows existing patterns:** Same card/table structure, toast notifications, URL sharing
- **No new dependencies:** Pure vanilla JS using existing UI utilities

### Watch Out For

- **Flag emoji support:** Older browsers/systems may not render flag emojis — falls back gracefully to empty string
- **Data availability:** Some datasets have sparse coverage — some countries may be missing from leaderboard
- **Sort direction:** For metrics where lower is better (unemployment), make sure `higherIsBetter: false` is set
- **Performance:** Fetching all 27 countries in one call is fine; the Eurostat API handles it well

---

## Summary

| Feature | Files to Create/Modify | Estimated Effort |
|---------|------------------------|------------------|
| EU Report Card | `report-card.html`, `js/config.js`, `css/style.css` | 1-2 days |
| EU Leaderboard | `leaderboard.html`, `js/config.js`, `css/style.css` | 0.5-1 day |

Both features leverage the existing codebase heavily — the main work is UI layout and simple data transformation (percentile calculation for grades, sorting for leaderboard). The existing caching layer will handle API efficiency automatically.
