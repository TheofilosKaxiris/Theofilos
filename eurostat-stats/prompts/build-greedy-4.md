# Build Greedy 4: Implementation Instructions

This document provides step-by-step instructions for implementing the selected ideas from Round 4.

---

## Project Context

**Tech Stack:**
- Vanilla JavaScript (ES6+), HTML5, CSS3
- No build tools — static site, no webpack/npm
- Bootstrap 5.3.3 (CDN)
- Chart.js for visualizations
- Eurostat API for data
- localStorage for persistence

**Key Files:**
- `config.js` — central configuration, dataset metadata, country data
- `ui.js` — UI utilities, toasts, card generation
- `style.css` — design system
- `index.html` — main explorer
- `move-quiz.html` + `move-quiz.js` — existing quiz implementation (reference pattern)

**Patterns:**
- IIFE for module isolation (see `move-quiz.js`)
- `CONFIG` object for all configuration
- `UI` object for shared utilities
- Navigation via `CONFIG.pages` array

---

## Idea 9: "What's Your Country's Superpower?" Identity Card

**What:** For each EU country, identify the ONE thing they're best at in Europe — a single claim to fame backed by data.

**Assessment: WORTH IT — High impact, low-medium effort**
- Effort: Min 1 day, Max 2 days
- Builds on: Existing `CONFIG.countries` (27 countries), `DATASETS` catalog, `CONFIG.moveQuiz.countryScores` (country data patterns)
- Already has: Card generator infrastructure (`UI.cardGenerator`), shareable URL patterns
- Key approach: Pre-computed superpowers stored in `CONFIG`, simple gallery page
- Main constraint: Need to manually curate which metric each country leads in (can't reliably auto-compute from live API due to filter complexity)

---

### Implementation Steps

#### Step 1: Add superpower data to config.js

Add a new `CONFIG.superpowers` object after `CONFIG.moveQuiz`. Each entry contains the country's #1 ranking metric with supporting data.

```javascript
CONFIG.superpowers = {
    AT: {
        name: 'Austria',
        flag: '\u{1F1E6}\u{1F1F9}',
        superpower: 'Highest Quality of Life Index',
        metric: 'Quality of Life',
        value: '8.4/10',
        source: 'EuroFound 2023',
        funFact: 'Vienna has been ranked the most liveable city in the world 3 years running'
    },
    BE: {
        name: 'Belgium',
        flag: '\u{1F1E7}\u{1F1EA}',
        superpower: 'Most Productive Workers',
        metric: 'GDP per hour worked',
        value: '€68.50',
        source: 'Eurostat 2023',
        funFact: 'Belgian workers produce more value per hour than any other EU nation'
    },
    BG: {
        name: 'Bulgaria',
        flag: '\u{1F1E7}\u{1F1EC}',
        superpower: 'Lowest Cost of Living',
        metric: 'Price Level Index',
        value: '47 (EU=100)',
        source: 'Eurostat 2023',
        funFact: 'Your euro goes twice as far in Sofia as in Paris'
    },
    HR: {
        name: 'Croatia',
        flag: '\u{1F1ED}\u{1F1F7}',
        superpower: 'Most Coastline per Capita',
        metric: 'Adriatic coastline',
        value: '1,777 km',
        source: 'Geographic data',
        funFact: '1,244 islands dot the Croatian coast'
    },
    CY: {
        name: 'Cyprus',
        flag: '\u{1F1E8}\u{1F1FE}',
        superpower: 'Sunniest Country',
        metric: 'Annual sunshine hours',
        value: '3,400 hours',
        source: 'Climate data',
        funFact: 'More sunshine than any EU member state'
    },
    CZ: {
        name: 'Czechia',
        flag: '\u{1F1E8}\u{1F1FF}',
        superpower: 'Lowest Unemployment',
        metric: 'Unemployment rate',
        value: '2.6%',
        source: 'Eurostat 2024',
        funFact: 'Virtually everyone who wants a job has one'
    },
    DK: {
        name: 'Denmark',
        flag: '\u{1F1E9}\u{1F1F0}',
        superpower: 'Happiest People',
        metric: 'Happiness Index',
        value: '7.6/10',
        source: 'World Happiness Report 2024',
        funFact: 'Danes invented hygge — cozy contentment as a lifestyle'
    },
    EE: {
        name: 'Estonia',
        flag: '\u{1F1EA}\u{1F1EA}',
        superpower: 'Most Digital Government',
        metric: 'Digital public services',
        value: '99% online',
        source: 'EU Digital Index 2023',
        funFact: 'Estonians can vote, pay taxes, and start a company from their phone'
    },
    FI: {
        name: 'Finland',
        flag: '\u{1F1EB}\u{1F1EE}',
        superpower: 'Best Education System',
        metric: 'PISA scores',
        value: 'Top 5 globally',
        source: 'OECD PISA 2022',
        funFact: 'Finnish kids have the shortest school days and least homework in Europe'
    },
    FR: {
        name: 'France',
        flag: '\u{1F1EB}\u{1F1F7}',
        superpower: 'Most Visited Country',
        metric: 'International tourists',
        value: '89M/year',
        source: 'UNWTO 2023',
        funFact: 'More people visit France than any other country on Earth'
    },
    DE: {
        name: 'Germany',
        flag: '\u{1F1E9}\u{1F1EA}',
        superpower: 'Largest Economy',
        metric: 'GDP',
        value: '€4.1 trillion',
        source: 'Eurostat 2023',
        funFact: 'Germany alone produces 25% of the EU\'s economic output'
    },
    EL: {
        name: 'Greece',
        flag: '\u{1F1EC}\u{1F1F7}',
        superpower: 'Most Islands',
        metric: 'Number of islands',
        value: '6,000+',
        source: 'Geographic data',
        funFact: 'Only 227 of Greece\'s islands are inhabited'
    },
    HU: {
        name: 'Hungary',
        flag: '\u{1F1ED}\u{1F1FA}',
        superpower: 'Most Thermal Springs',
        metric: 'Thermal baths',
        value: '1,500+',
        source: 'Tourism data',
        funFact: 'Budapest has more thermal baths than any other capital city'
    },
    IE: {
        name: 'Ireland',
        flag: '\u{1F1EE}\u{1F1EA}',
        superpower: 'Highest GDP per Capita',
        metric: 'GDP per capita',
        value: '€103,000',
        source: 'Eurostat 2023',
        funFact: 'Ireland\'s GDP per person exceeds Switzerland and the USA'
    },
    IT: {
        name: 'Italy',
        flag: '\u{1F1EE}\u{1F1F9}',
        superpower: 'Most UNESCO Sites',
        metric: 'World Heritage Sites',
        value: '59 sites',
        source: 'UNESCO 2024',
        funFact: 'More cultural heritage sites than any country on Earth'
    },
    LV: {
        name: 'Latvia',
        flag: '\u{1F1F1}\u{1F1FB}',
        superpower: 'Fastest Internet',
        metric: 'Average broadband speed',
        value: '90 Mbps',
        source: 'Speedtest Global Index',
        funFact: 'Riga has some of the fastest fiber connections in the world'
    },
    LT: {
        name: 'Lithuania',
        flag: '\u{1F1F1}\u{1F1F9}',
        superpower: 'Most Fintech Licenses',
        metric: 'EU fintech licenses',
        value: '140+',
        source: 'Bank of Lithuania 2024',
        funFact: 'Lithuania has become Europe\'s fintech capital'
    },
    LU: {
        name: 'Luxembourg',
        flag: '\u{1F1F1}\u{1F1FA}',
        superpower: 'Highest Wages',
        metric: 'Average annual salary',
        value: '€72,000',
        source: 'Eurostat 2023',
        funFact: 'Luxembourg\'s minimum wage exceeds most countries\' averages'
    },
    MT: {
        name: 'Malta',
        flag: '\u{1F1F2}\u{1F1F9}',
        superpower: 'Most English Speakers',
        metric: 'English proficiency',
        value: '95%',
        source: 'Eurobarometer',
        funFact: 'English is an official language — the only EU country besides Ireland'
    },
    NL: {
        name: 'Netherlands',
        flag: '\u{1F1F3}\u{1F1F1}',
        superpower: 'Best Work-Life Balance',
        metric: 'Part-time employment',
        value: '50%',
        source: 'Eurostat 2023',
        funFact: 'Half of Dutch workers choose part-time — and they\'re the happiest about it'
    },
    PL: {
        name: 'Poland',
        flag: '\u{1F1F5}\u{1F1F1}',
        superpower: 'Fastest Growing Economy',
        metric: '20-year GDP growth',
        value: '+147%',
        source: 'Eurostat 2004-2024',
        funFact: 'Poland is the only EU country to avoid recession during the 2008 crisis'
    },
    PT: {
        name: 'Portugal',
        flag: '\u{1F1F5}\u{1F1F9}',
        superpower: 'Best Renewable Energy Growth',
        metric: 'Renewable share increase',
        value: '+35% since 2010',
        source: 'Eurostat Energy',
        funFact: 'Portugal ran on 100% renewables for 6 days straight in 2024'
    },
    RO: {
        name: 'Romania',
        flag: '\u{1F1F7}\u{1F1F4}',
        superpower: 'Fastest Mobile Internet',
        metric: '5G download speed',
        value: '220 Mbps',
        source: 'Opensignal 2024',
        funFact: 'Bucharest has faster mobile internet than New York or London'
    },
    SK: {
        name: 'Slovakia',
        flag: '\u{1F1F8}\u{1F1F0}',
        superpower: 'Most Cars Produced per Capita',
        metric: 'Car production per capita',
        value: '202 cars/1000 people',
        source: 'ACEA 2023',
        funFact: 'Slovakia builds more cars per person than any country on Earth'
    },
    SI: {
        name: 'Slovenia',
        flag: '\u{1F1F8}\u{1F1EE}',
        superpower: 'Most Forested Country',
        metric: 'Forest coverage',
        value: '58%',
        source: 'Eurostat Environment',
        funFact: 'More than half of Slovenia is covered in forest'
    },
    ES: {
        name: 'Spain',
        flag: '\u{1F1EA}\u{1F1F8}',
        superpower: 'Longest Life Expectancy',
        metric: 'Life expectancy',
        value: '84 years',
        source: 'Eurostat 2023',
        funFact: 'Spaniards live longer than any other EU citizens'
    },
    SE: {
        name: 'Sweden',
        flag: '\u{1F1F8}\u{1F1EA}',
        superpower: 'Most Innovative Economy',
        metric: 'Innovation Index',
        value: '#1 in EU',
        source: 'EU Innovation Scoreboard 2024',
        funFact: 'Sweden has produced more billion-dollar startups per capita than anywhere except Silicon Valley'
    }
};
```

#### Step 2: Create superpowers.html

Create a new file `superpowers.html` in the project root.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google-adsense-account" content="ca-pub-6474686113446159">
    <title>What's Your Country's Superpower? | Eurostat Explorer</title>
    <meta name="description" content="Discover the ONE thing each EU country does better than anyone else. 27 countries, 27 superpowers — backed by Eurostat data.">
    <meta name="keywords" content="Eurostat, EU countries, country rankings, best in Europe, national pride, country comparison">
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="What's Your Country's Superpower? | Eurostat Explorer">
    <meta property="og:description" content="Discover the ONE thing each EU country does better than anyone else.">
    <meta property="og:type" content="website">
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="What's Your Country's Superpower? | Eurostat Explorer">
    <meta name="twitter:description" content="Discover the ONE thing each EU country does better than anyone else.">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="apple-touch-icon" sizes="180x180" href="../favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon/favicon-16x16.png">
    <link rel="shortcut icon" href="../favicon/favicon.ico">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-599PBS1V4S"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-599PBS1V4S');
    </script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6474686113446159" crossorigin="anonymous"></script>
</head>
<body>
    <header>
        <h1>Country Superpowers</h1>
        <p class="subtitle">Every EU country is #1 at something. Find yours.</p>
        <nav id="mainNav"></nav>
    </header>
    <div class="container-fluid flex-grow-1">
        <div class="row">
            <div class="col-lg-2 d-none d-lg-flex flex-column align-items-center justify-content-start p-0">
                <ins class="adsbygoogle"
                    style="display:block;width:160px;height:600px"
                    data-ad-client="ca-pub-6474686113446159"
                    data-ad-slot="1234567890"></ins>
            </div>
            <main class="col-12 col-lg-8 d-flex flex-column align-items-center py-3">

                <section class="card w-100 my-2">
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-12 col-md-6">
                                <input type="text" id="searchCountry" class="form-control" placeholder="Search for a country...">
                            </div>
                            <div class="col-12 col-md-6 mt-2 mt-md-0">
                                <select id="sortBy" class="form-select">
                                    <option value="alpha">Sort: A-Z</option>
                                    <option value="random">Sort: Random</option>
                                </select>
                            </div>
                        </div>
                        <div id="superpowerGrid" class="superpower-grid">
                            <!-- Cards rendered by JS -->
                        </div>
                    </div>
                </section>

            </main>
            <div class="col-lg-2 d-none d-lg-flex flex-column align-items-center justify-content-start p-0">
                <ins class="adsbygoogle"
                    style="display:block;width:160px;height:600px"
                    data-ad-client="ca-pub-6474686113446159"
                    data-ad-slot="1234567890"></ins>
            </div>
        </div>
    </div>
    <footer>
        <div class="container">
            Data provided by <a href="https://ec.europa.eu/eurostat" target="_blank">Eurostat</a> &mdash;
            <a href="https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started" target="_blank">API Documentation</a>
        </div>
    </footer>
    <script src="js/config.js"></script>
    <script src="js/cache.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/superpowers.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.getElementById('mainNav').innerHTML = UI.navHTML('superpowers');
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    </script>
</body>
</html>
```

#### Step 3: Create js/superpowers.js

Create the JavaScript module for the superpowers page.

```javascript
// Eurostat Stats — Country Superpowers
// "What's Your Country's Superpower?" identity cards

(function() {
    'use strict';

    var state = {
        filter: '',
        sort: 'alpha'
    };

    document.addEventListener('DOMContentLoaded', function() {
        renderGrid();
        attachEventListeners();
        checkUrlForCountry();
    });

    function renderGrid() {
        var container = document.getElementById('superpowerGrid');
        var superpowers = CONFIG.superpowers;
        var codes = Object.keys(superpowers);

        // Apply filter
        if (state.filter) {
            var q = state.filter.toLowerCase();
            codes = codes.filter(function(code) {
                var s = superpowers[code];
                return s.name.toLowerCase().includes(q) ||
                       s.superpower.toLowerCase().includes(q) ||
                       code.toLowerCase().includes(q);
            });
        }

        // Apply sort
        if (state.sort === 'alpha') {
            codes.sort(function(a, b) {
                return superpowers[a].name.localeCompare(superpowers[b].name);
            });
        } else if (state.sort === 'random') {
            codes.sort(function() { return Math.random() - 0.5; });
        }

        if (codes.length === 0) {
            container.innerHTML = '<p class="text-muted">No countries match your search.</p>';
            return;
        }

        var html = '';
        codes.forEach(function(code) {
            var s = superpowers[code];
            html += buildCard(code, s);
        });

        container.innerHTML = html;

        // Attach share button handlers
        container.querySelectorAll('.btn-share-superpower').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var code = this.dataset.code;
                shareCard(code);
            });
        });

        // Attach download button handlers
        container.querySelectorAll('.btn-download-superpower').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var code = this.dataset.code;
                downloadCard(code);
            });
        });
    }

    function buildCard(code, data) {
        return (
            '<div class="superpower-card" data-code="' + code + '">' +
                '<div class="superpower-card-front">' +
                    '<div class="superpower-flag">' + data.flag + '</div>' +
                    '<div class="superpower-country">' + UI._esc(data.name) + '</div>' +
                    '<div class="superpower-title">Europe\'s #1 in</div>' +
                    '<div class="superpower-metric">' + UI._esc(data.superpower) + '</div>' +
                    '<div class="superpower-value">' + UI._esc(data.value) + '</div>' +
                    '<div class="superpower-source">Source: ' + UI._esc(data.source) + '</div>' +
                '</div>' +
                '<div class="superpower-card-back">' +
                    '<div class="superpower-funfact">' + UI._esc(data.funFact) + '</div>' +
                    '<div class="superpower-actions">' +
                        '<button class="btn-action btn-share-superpower" data-code="' + code + '">Share</button>' +
                        '<button class="btn-action btn-download-superpower" data-code="' + code + '">Download</button>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function attachEventListeners() {
        document.getElementById('searchCountry').addEventListener('input', function() {
            state.filter = this.value;
            renderGrid();
        });

        document.getElementById('sortBy').addEventListener('change', function() {
            state.sort = this.value;
            renderGrid();
        });
    }

    function shareCard(code) {
        var url = window.location.origin + window.location.pathname + '?country=' + code;
        navigator.clipboard.writeText(url).then(function() {
            UI.toast('Share link copied!', 'success');
        }).catch(function() {
            UI.toast('Could not copy link', 'error');
        });
    }

    function downloadCard(code) {
        var data = CONFIG.superpowers[code];
        if (!data) return;

        // Create canvas for image generation
        var canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        var ctx = canvas.getContext('2d');

        // Background
        var gradient = ctx.createLinearGradient(0, 0, 0, 1080);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);

        // Flag emoji (large)
        ctx.font = '150px serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.flag, 540, 200);

        // Country name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px system-ui, sans-serif';
        ctx.fillText(data.name, 540, 320);

        // "Europe's #1 in"
        ctx.fillStyle = '#e94560';
        ctx.font = '32px system-ui, sans-serif';
        ctx.fillText("EUROPE'S #1 IN", 540, 420);

        // Superpower
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px system-ui, sans-serif';
        wrapText(ctx, data.superpower, 540, 500, 900, 56);

        // Value
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 72px system-ui, sans-serif';
        ctx.fillText(data.value, 540, 680);

        // Fun fact
        ctx.fillStyle = '#cccccc';
        ctx.font = '28px system-ui, sans-serif';
        wrapText(ctx, data.funFact, 540, 800, 900, 36);

        // Footer
        ctx.fillStyle = '#666666';
        ctx.font = '24px system-ui, sans-serif';
        ctx.fillText('eurostat-explorer.com', 540, 1020);

        // Border
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 1072, 1072);

        // Download
        var link = document.createElement('a');
        link.download = data.name.toLowerCase().replace(/\s+/g, '-') + '-superpower.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        UI.toast('Card downloaded!', 'success');
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';
        var lines = [];

        for (var i = 0; i < words.length; i++) {
            var testLine = line + words[i] + ' ';
            var metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        var startY = y - ((lines.length - 1) * lineHeight) / 2;
        for (var j = 0; j < lines.length; j++) {
            ctx.fillText(lines[j].trim(), x, startY + (j * lineHeight));
        }
    }

    function checkUrlForCountry() {
        var params = new URLSearchParams(window.location.search);
        var country = params.get('country');
        if (country && CONFIG.superpowers[country.toUpperCase()]) {
            // Scroll to the card and highlight it
            setTimeout(function() {
                var card = document.querySelector('[data-code="' + country.toUpperCase() + '"]');
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.classList.add('superpower-card-highlight');
                }
            }, 100);
        }
    }
})();
```

#### Step 4: Add CSS styles to style.css

Add the following styles at the end of `css/style.css`:

```css
/* ── Superpower Cards ────────────────────────────────────── */

.superpower-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.superpower-card {
    position: relative;
    height: 360px;
    perspective: 1000px;
    cursor: pointer;
}

.superpower-card-front,
.superpower-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: transform 0.6s;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.superpower-card-front {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #fff;
}

.superpower-card-back {
    background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
    color: #fff;
    transform: rotateY(180deg);
}

.superpower-card:hover .superpower-card-front {
    transform: rotateY(-180deg);
}

.superpower-card:hover .superpower-card-back {
    transform: rotateY(0deg);
}

.superpower-flag {
    font-size: 4rem;
    margin-bottom: 0.5rem;
}

.superpower-country {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
}

.superpower-title {
    font-size: 0.875rem;
    color: #e94560;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
}

.superpower-metric {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    line-height: 1.3;
}

.superpower-value {
    font-size: 2rem;
    font-weight: 700;
    color: #00d4ff;
    margin-bottom: 0.5rem;
}

.superpower-source {
    font-size: 0.75rem;
    color: #888;
}

.superpower-funfact {
    font-size: 1.1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    font-style: italic;
}

.superpower-actions {
    display: flex;
    gap: 0.75rem;
}

.superpower-card-highlight {
    animation: superpower-pulse 2s ease-in-out;
}

@keyframes superpower-pulse {
    0%, 100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 30px rgba(233, 69, 96, 0.6); }
}

@media (max-width: 576px) {
    .superpower-card {
        height: 320px;
    }
    .superpower-flag {
        font-size: 3rem;
    }
    .superpower-country {
        font-size: 1.25rem;
    }
    .superpower-value {
        font-size: 1.5rem;
    }
}
```

#### Step 5: Add to navigation

In `config.js`, add the superpowers page to `CONFIG.pages`:

```javascript
pages: [
    { id: 'index',        label: 'Explorer',     href: 'index.html',               icon: 'search' },
    { id: 'economy',      label: 'Economy',      href: 'dashboard.html?page=economy',      icon: 'chart-line' },
    { id: 'tourism',      label: 'Tourism',      href: 'dashboard.html?page=tourism',      icon: 'plane' },
    { id: 'employment',   label: 'Employment',   href: 'dashboard.html?page=employment',   icon: 'briefcase' },
    { id: 'demographics', label: 'Demographics', href: 'dashboard.html?page=demographics', icon: 'users' },
    { id: 'environment',  label: 'Environment',  href: 'dashboard.html?page=environment',  icon: 'leaf' },
    { id: 'superpowers',  label: 'Superpowers',  href: 'superpowers.html',         icon: 'star' },
    { id: 'move-quiz',    label: 'Move Quiz',    href: 'move-quiz.html',           icon: 'compass' },
],
```

---

### Keep It Clean

1. **Follow existing patterns**: The `superpowers.js` module uses the same IIFE pattern as `move-quiz.js`
2. **Use existing utilities**: Leverages `UI._esc()`, `UI.toast()` for consistency
3. **Configuration-driven**: All data lives in `CONFIG.superpowers`, making updates easy
4. **No new dependencies**: Pure vanilla JS, canvas API for image generation
5. **Reuse card generator concepts**: Image download uses the same canvas approach as `UI.cardGenerator`

---

### Watch Out For

1. **Emoji rendering in canvas**: Some browsers render flag emojis differently. The canvas `fillText` for emojis works but may look different across platforms.

2. **Mobile hover behavior**: The flip-on-hover effect doesn't work well on touch. Consider adding a tap-to-flip alternative or showing both sides in a different layout on mobile.

3. **Data accuracy**: The superpower data is manually curated. Verify each claim with source data before shipping. Some metrics change year-to-year (e.g., unemployment rankings).

4. **SEO for individual cards**: The `?country=DE` URL parameter allows direct linking but won't have unique meta tags. For better SEO, consider server-side rendering or pre-generated static pages per country.

5. **Large flag emojis**: On Windows, flag emojis may render as two-letter codes instead of flags in some contexts. The flag should display correctly in HTML but may look different in the downloaded PNG.

---

## Idea 6: The "Rich or Poor?" Perception Quiz

**What:** Show country stats without revealing which country. User guesses if it's a "rich" or "poor" EU country, then sees the surprising answer.

**Assessment: WORTH IT — High impact, medium effort**
- Effort: Min 2 days, Max 3 days
- Builds on: Existing quiz infrastructure (`move-quiz.js`, `move-quiz.html`), `CONFIG.countries`, shareable URL patterns
- Key approach: Pre-built question bank with stats, multiple-choice format, score tracking
- Main constraint: Questions must be carefully designed to create genuine surprise — need real data that defies stereotypes

---

### Implementation Steps

#### Step 1: Add quiz data to config.js

Add `CONFIG.perceptionQuiz` after `CONFIG.superpowers`:

```javascript
CONFIG.perceptionQuiz = {
    questions: [
        {
            id: 'q1',
            stats: {
                'GDP per capita': '€35,000',
                'Unemployment': '11.5%',
                'Government debt': '140% of GDP'
            },
            answer: 'IT',
            options: ['IT', 'ES', 'EL', 'PT'],
            explanation: 'Italy has high GDP per capita but also high unemployment and massive debt — a complex economy that defies simple rich/poor labels.'
        },
        {
            id: 'q2',
            stats: {
                'GDP per capita': '€12,000',
                'Unemployment': '2.8%',
                'GDP growth (5yr)': '+28%'
            },
            answer: 'PL',
            options: ['PL', 'RO', 'BG', 'HU'],
            explanation: 'Poland has lower wages than Western Europe but near-full employment and explosive growth. It\'s the EU\'s biggest success story.'
        },
        {
            id: 'q3',
            stats: {
                'GDP per capita': '€103,000',
                'Population': '5.1 million',
                'Corporate tax haven': 'Yes'
            },
            answer: 'IE',
            options: ['LU', 'IE', 'NL', 'DK'],
            explanation: 'Ireland\'s GDP is inflated by multinationals routing profits through Dublin, but the wealth effect is real — tech workers earn Silicon Valley salaries.'
        },
        {
            id: 'q4',
            stats: {
                'Unemployment': '12.1%',
                'Youth unemployment': '26%',
                'Life expectancy': '84.3 years (EU\'s highest)'
            },
            answer: 'ES',
            options: ['ES', 'IT', 'EL', 'PT'],
            explanation: 'Spain has chronic unemployment but also Europe\'s longest life expectancy. Quality of life isn\'t just about jobs.'
        },
        {
            id: 'q5',
            stats: {
                'GDP per capita': '€48,000',
                'Happiness rank': '#2 in world',
                'Personal tax rate': 'Up to 55%'
            },
            answer: 'DK',
            options: ['DK', 'SE', 'FI', 'NL'],
            explanation: 'Denmark: extremely high taxes, extremely happy people. The "expensive = worse" assumption doesn\'t hold.'
        },
        {
            id: 'q6',
            stats: {
                'GDP per capita': '€50,000',
                'Average working hours': '1,349/year (lowest in EU)',
                'Part-time rate': '50%'
            },
            answer: 'NL',
            options: ['NL', 'DE', 'BE', 'AT'],
            explanation: 'The Dutch work the fewest hours in Europe yet remain one of the richest. Efficiency over hustle.'
        },
        {
            id: 'q7',
            stats: {
                'GDP per capita': '€18,000',
                'Digital government': 'World\'s most advanced',
                'Tech startups per capita': 'Higher than Germany'
            },
            answer: 'EE',
            options: ['EE', 'FI', 'LT', 'LV'],
            explanation: 'Estonia: former Soviet state, now digital pioneer. They skipped the 20th century and built the future.'
        },
        {
            id: 'q8',
            stats: {
                'GDP per capita': '€17,500',
                'Unemployment': '27.3% (2013)',
                'Tourism revenue': '€20 billion/year'
            },
            answer: 'EL',
            options: ['EL', 'PT', 'HR', 'CY'],
            explanation: 'Greece went from near-collapse to tourism boom. The 2013 unemployment figure shows how far they\'ve come.'
        },
        {
            id: 'q9',
            stats: {
                'GDP per capita': '€128,000',
                'Population': '660,000',
                'Banking sector': '22x GDP'
            },
            answer: 'LU',
            options: ['LU', 'IE', 'MT', 'CY'],
            explanation: 'Luxembourg is absurdly rich on paper, but half the workforce commutes from neighboring countries. The wealth is real but concentrated.'
        },
        {
            id: 'q10',
            stats: {
                'GDP per capita': '€9,500',
                'IT sector growth': '+300% (10yr)',
                'Emigration': '100,000/year'
            },
            answer: 'RO',
            options: ['RO', 'BG', 'HR', 'PL'],
            explanation: 'Romania bleeds talent to Western Europe while simultaneously building Europe\'s hottest tech scene. Both things are true.'
        }
    ],

    // Score interpretation
    scoreMessages: {
        '0-3': {
            title: 'Tourist-Level Knowledge',
            message: 'You believe the stereotypes. Time to look at the data!'
        },
        '4-6': {
            title: 'Casual Observer',
            message: 'You know more than most, but Europe\'s economy still has surprises for you.'
        },
        '7-8': {
            title: 'Economics Nerd',
            message: 'You understand that wealth is complicated. Most people don\'t get this many right.'
        },
        '9-10': {
            title: 'Eurostat Expert',
            message: 'You either work in EU policy or you spend way too much time on data sites. Either way, impressive.'
        }
    }
};
```

#### Step 2: Create perception-quiz.html

Create a new file `perception-quiz.html` in the project root:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google-adsense-account" content="ca-pub-6474686113446159">
    <title>Rich or Poor? EU Perception Quiz | Eurostat Explorer</title>
    <meta name="description" content="Can you guess which EU country these stats belong to? Challenge your assumptions about Europe's economies.">
    <meta name="keywords" content="Eurostat, EU quiz, European economy, country quiz, GDP, rich poor, perception">
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="Rich or Poor? EU Perception Quiz | Eurostat Explorer">
    <meta property="og:description" content="Can you guess which EU country these stats belong to?">
    <meta property="og:type" content="website">
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Rich or Poor? EU Perception Quiz | Eurostat Explorer">
    <meta name="twitter:description" content="Can you guess which EU country these stats belong to?">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="apple-touch-icon" sizes="180x180" href="../favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon/favicon-16x16.png">
    <link rel="shortcut icon" href="../favicon/favicon.ico">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-599PBS1V4S"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-599PBS1V4S');
    </script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6474686113446159" crossorigin="anonymous"></script>
</head>
<body>
    <header>
        <h1>Rich or Poor?</h1>
        <p class="subtitle">Guess the country. Challenge your assumptions.</p>
        <nav id="mainNav"></nav>
    </header>
    <div class="container-fluid flex-grow-1">
        <div class="row">
            <div class="col-lg-2 d-none d-lg-flex flex-column align-items-center justify-content-start p-0">
                <ins class="adsbygoogle"
                    style="display:block;width:160px;height:600px"
                    data-ad-client="ca-pub-6474686113446159"
                    data-ad-slot="1234567890"></ins>
            </div>
            <main class="col-12 col-lg-8 d-flex flex-column align-items-center py-3">

                <section id="quizContainer" class="card w-100 my-2">
                    <div class="card-body">
                        <!-- Quiz rendered by JS -->
                    </div>
                </section>

                <section id="resultsContainer" class="card w-100 my-2" style="display:none;">
                    <div class="card-body">
                        <!-- Results rendered by JS -->
                    </div>
                </section>

            </main>
            <div class="col-lg-2 d-none d-lg-flex flex-column align-items-center justify-content-start p-0">
                <ins class="adsbygoogle"
                    style="display:block;width:160px;height:600px"
                    data-ad-client="ca-pub-6474686113446159"
                    data-ad-slot="1234567890"></ins>
            </div>
        </div>
    </div>
    <footer>
        <div class="container">
            Data provided by <a href="https://ec.europa.eu/eurostat" target="_blank">Eurostat</a> &mdash;
            <a href="https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started" target="_blank">API Documentation</a>
        </div>
    </footer>
    <script src="js/config.js"></script>
    <script src="js/cache.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/perception-quiz.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.getElementById('mainNav').innerHTML = UI.navHTML('perception-quiz');
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    </script>
</body>
</html>
```

#### Step 3: Create js/perception-quiz.js

Create the JavaScript module for the quiz:

```javascript
// Eurostat Stats — Perception Quiz
// "Rich or Poor?" country guessing game

(function() {
    'use strict';

    var state = {
        currentQuestion: 0,
        answers: [],        // Array of { questionId, selectedAnswer, correct }
        finished: false
    };

    document.addEventListener('DOMContentLoaded', function() {
        renderQuestion();
    });

    function getCountryName(code) {
        return CONFIG.countries[code] || code;
    }

    function getCountryFlag(code) {
        // Convert country code to flag emoji
        var flags = {
            AT: '\u{1F1E6}\u{1F1F9}', BE: '\u{1F1E7}\u{1F1EA}', BG: '\u{1F1E7}\u{1F1EC}',
            HR: '\u{1F1ED}\u{1F1F7}', CY: '\u{1F1E8}\u{1F1FE}', CZ: '\u{1F1E8}\u{1F1FF}',
            DK: '\u{1F1E9}\u{1F1F0}', EE: '\u{1F1EA}\u{1F1EA}', FI: '\u{1F1EB}\u{1F1EE}',
            FR: '\u{1F1EB}\u{1F1F7}', DE: '\u{1F1E9}\u{1F1EA}', EL: '\u{1F1EC}\u{1F1F7}',
            HU: '\u{1F1ED}\u{1F1FA}', IE: '\u{1F1EE}\u{1F1EA}', IT: '\u{1F1EE}\u{1F1F9}',
            LV: '\u{1F1F1}\u{1F1FB}', LT: '\u{1F1F1}\u{1F1F9}', LU: '\u{1F1F1}\u{1F1FA}',
            MT: '\u{1F1F2}\u{1F1F9}', NL: '\u{1F1F3}\u{1F1F1}', PL: '\u{1F1F5}\u{1F1F1}',
            PT: '\u{1F1F5}\u{1F1F9}', RO: '\u{1F1F7}\u{1F1F4}', SK: '\u{1F1F8}\u{1F1F0}',
            SI: '\u{1F1F8}\u{1F1EE}', ES: '\u{1F1EA}\u{1F1F8}', SE: '\u{1F1F8}\u{1F1EA}'
        };
        return flags[code] || '';
    }

    function renderQuestion() {
        var container = document.querySelector('#quizContainer .card-body');
        var questions = CONFIG.perceptionQuiz.questions;
        var q = questions[state.currentQuestion];

        var html = '';

        // Progress bar
        html += '<div class="quiz-progress mb-4">';
        html += '<div class="d-flex justify-content-between mb-2">';
        html += '<span>Question ' + (state.currentQuestion + 1) + ' of ' + questions.length + '</span>';
        html += '<span>Score: ' + getScore() + '/' + state.currentQuestion + '</span>';
        html += '</div>';
        html += '<div class="progress" style="height: 8px;">';
        var pct = ((state.currentQuestion) / questions.length) * 100;
        html += '<div class="progress-bar" style="width:' + pct + '%;"></div>';
        html += '</div></div>';

        // Stats display
        html += '<div class="perception-stats-card mb-4">';
        html += '<h3 class="text-center mb-4">Which country has these stats?</h3>';
        html += '<div class="perception-stats-grid">';
        for (var stat in q.stats) {
            html += '<div class="perception-stat">';
            html += '<div class="perception-stat-label">' + UI._esc(stat) + '</div>';
            html += '<div class="perception-stat-value">' + UI._esc(q.stats[stat]) + '</div>';
            html += '</div>';
        }
        html += '</div></div>';

        // Answer options
        html += '<div class="perception-options">';
        q.options.forEach(function(code) {
            html += '<button class="perception-option" data-code="' + code + '">';
            html += '<span class="perception-option-flag">' + getCountryFlag(code) + '</span>';
            html += '<span class="perception-option-name">' + UI._esc(getCountryName(code)) + '</span>';
            html += '</button>';
        });
        html += '</div>';

        container.innerHTML = html;

        // Attach click handlers
        container.querySelectorAll('.perception-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                handleAnswer(this.dataset.code);
            });
        });
    }

    function handleAnswer(selectedCode) {
        var q = CONFIG.perceptionQuiz.questions[state.currentQuestion];
        var correct = selectedCode === q.answer;

        state.answers.push({
            questionId: q.id,
            selectedAnswer: selectedCode,
            correct: correct
        });

        // Show feedback
        showFeedback(q, selectedCode, correct);
    }

    function showFeedback(question, selectedCode, correct) {
        var container = document.querySelector('#quizContainer .card-body');

        var html = '';

        // Result header
        html += '<div class="perception-feedback text-center mb-4">';
        if (correct) {
            html += '<div class="perception-result perception-correct">';
            html += '<span class="perception-result-icon">&#10003;</span> Correct!';
            html += '</div>';
        } else {
            html += '<div class="perception-result perception-incorrect">';
            html += '<span class="perception-result-icon">&#10007;</span> Not quite!';
            html += '</div>';
        }
        html += '</div>';

        // Answer reveal
        html += '<div class="perception-reveal text-center mb-4">';
        html += '<div class="perception-reveal-flag">' + getCountryFlag(question.answer) + '</div>';
        html += '<div class="perception-reveal-country">' + UI._esc(getCountryName(question.answer)) + '</div>';
        html += '</div>';

        // Explanation
        html += '<div class="perception-explanation mb-4">';
        html += '<p>' + UI._esc(question.explanation) + '</p>';
        html += '</div>';

        // Next button
        html += '<div class="text-center">';
        if (state.currentQuestion < CONFIG.perceptionQuiz.questions.length - 1) {
            html += '<button id="nextQuestionBtn" class="btn-visualize">Next Question</button>';
        } else {
            html += '<button id="showResultsBtn" class="btn-visualize">See My Results</button>';
        }
        html += '</div>';

        container.innerHTML = html;

        // Attach handlers
        var nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                state.currentQuestion++;
                renderQuestion();
            });
        }

        var resultsBtn = document.getElementById('showResultsBtn');
        if (resultsBtn) {
            resultsBtn.addEventListener('click', function() {
                state.finished = true;
                renderResults();
            });
        }
    }

    function getScore() {
        return state.answers.filter(function(a) { return a.correct; }).length;
    }

    function getScoreMessage(score) {
        var messages = CONFIG.perceptionQuiz.scoreMessages;
        if (score <= 3) return messages['0-3'];
        if (score <= 6) return messages['4-6'];
        if (score <= 8) return messages['7-8'];
        return messages['9-10'];
    }

    function renderResults() {
        document.getElementById('quizContainer').style.display = 'none';
        var container = document.querySelector('#resultsContainer .card-body');
        document.getElementById('resultsContainer').style.display = 'block';

        var score = getScore();
        var total = CONFIG.perceptionQuiz.questions.length;
        var msg = getScoreMessage(score);

        var html = '';

        // Score display
        html += '<div class="perception-final-score text-center mb-4">';
        html += '<div class="perception-score-number">' + score + '/' + total + '</div>';
        html += '<div class="perception-score-title">' + UI._esc(msg.title) + '</div>';
        html += '<div class="perception-score-message">' + UI._esc(msg.message) + '</div>';
        html += '</div>';

        // Score breakdown
        html += '<div class="perception-breakdown mb-4">';
        html += '<h4>Your Answers</h4>';
        CONFIG.perceptionQuiz.questions.forEach(function(q, i) {
            var answer = state.answers[i];
            var icon = answer.correct ? '&#10003;' : '&#10007;';
            var cls = answer.correct ? 'perception-answer-correct' : 'perception-answer-incorrect';
            html += '<div class="perception-answer-row ' + cls + '">';
            html += '<span class="perception-answer-icon">' + icon + '</span>';
            html += '<span>' + getCountryFlag(q.answer) + ' ' + UI._esc(getCountryName(q.answer)) + '</span>';
            if (!answer.correct) {
                html += '<span class="text-muted">(you said: ' + UI._esc(getCountryName(answer.selectedAnswer)) + ')</span>';
            }
            html += '</div>';
        });
        html += '</div>';

        // Actions
        html += '<div class="d-flex gap-3 justify-content-center">';
        html += '<button id="shareResultsBtn" class="btn-action">Share Results</button>';
        html += '<button id="retryQuizBtn" class="btn-action">Try Again</button>';
        html += '</div>';

        container.innerHTML = html;

        // Scroll to results
        document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth' });

        // Attach handlers
        document.getElementById('shareResultsBtn').addEventListener('click', shareResults);
        document.getElementById('retryQuizBtn').addEventListener('click', retryQuiz);
    }

    function shareResults() {
        var score = getScore();
        var total = CONFIG.perceptionQuiz.questions.length;
        var url = window.location.origin + window.location.pathname;
        var text = 'I scored ' + score + '/' + total + ' on the "Rich or Poor?" EU quiz! Can you beat me? ' + url;

        if (navigator.share) {
            navigator.share({
                title: 'Rich or Poor? EU Quiz',
                text: text,
                url: url
            }).catch(function() {});
        } else {
            navigator.clipboard.writeText(text).then(function() {
                UI.toast('Results copied to clipboard!', 'success');
            }).catch(function() {
                UI.toast('Could not copy results', 'error');
            });
        }
    }

    function retryQuiz() {
        state.currentQuestion = 0;
        state.answers = [];
        state.finished = false;

        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
        renderQuestion();
    }
})();
```

#### Step 4: Add CSS styles to style.css

Add the following styles at the end of `css/style.css`:

```css
/* ── Perception Quiz ─────────────────────────────────────── */

.perception-stats-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 12px;
    padding: 2rem;
    color: #fff;
}

.perception-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.perception-stat {
    text-align: center;
}

.perception-stat-label {
    font-size: 0.875rem;
    color: #888;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.perception-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #00d4ff;
}

.perception-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.perception-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border: 2px solid var(--border);
    border-radius: 8px;
    background: var(--bg-card);
    cursor: pointer;
    transition: all 0.2s;
}

.perception-option:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
}

.perception-option-flag {
    font-size: 2rem;
}

.perception-option-name {
    font-size: 1.1rem;
    font-weight: 600;
}

.perception-result {
    font-size: 1.5rem;
    font-weight: 700;
    padding: 1rem 2rem;
    border-radius: 8px;
    display: inline-block;
}

.perception-correct {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
}

.perception-incorrect {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.perception-result-icon {
    margin-right: 0.5rem;
}

.perception-reveal-flag {
    font-size: 5rem;
    margin-bottom: 0.5rem;
}

.perception-reveal-country {
    font-size: 2rem;
    font-weight: 700;
}

.perception-explanation {
    background: var(--bg-card);
    border-left: 4px solid var(--primary);
    padding: 1rem 1.5rem;
    border-radius: 0 8px 8px 0;
}

.perception-final-score {
    padding: 2rem;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 12px;
    color: #fff;
}

.perception-score-number {
    font-size: 4rem;
    font-weight: 700;
    color: #00d4ff;
}

.perception-score-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.perception-score-message {
    color: #ccc;
}

.perception-breakdown {
    background: var(--bg-card);
    border-radius: 8px;
    padding: 1.5rem;
}

.perception-breakdown h4 {
    margin-bottom: 1rem;
}

.perception-answer-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border);
}

.perception-answer-row:last-child {
    border-bottom: none;
}

.perception-answer-icon {
    width: 24px;
    text-align: center;
}

.perception-answer-correct .perception-answer-icon {
    color: #22c55e;
}

.perception-answer-incorrect .perception-answer-icon {
    color: #ef4444;
}

@media (max-width: 576px) {
    .perception-options {
        grid-template-columns: 1fr;
    }

    .perception-stats-grid {
        grid-template-columns: 1fr;
    }

    .perception-score-number {
        font-size: 3rem;
    }

    .perception-reveal-flag {
        font-size: 4rem;
    }
}
```

#### Step 5: Add to navigation

In `config.js`, update `CONFIG.pages` to include the perception quiz:

```javascript
pages: [
    { id: 'index',          label: 'Explorer',     href: 'index.html',               icon: 'search' },
    { id: 'economy',        label: 'Economy',      href: 'dashboard.html?page=economy',      icon: 'chart-line' },
    { id: 'tourism',        label: 'Tourism',      href: 'dashboard.html?page=tourism',      icon: 'plane' },
    { id: 'employment',     label: 'Employment',   href: 'dashboard.html?page=employment',   icon: 'briefcase' },
    { id: 'demographics',   label: 'Demographics', href: 'dashboard.html?page=demographics', icon: 'users' },
    { id: 'environment',    label: 'Environment',  href: 'dashboard.html?page=environment',  icon: 'leaf' },
    { id: 'superpowers',    label: 'Superpowers',  href: 'superpowers.html',         icon: 'star' },
    { id: 'perception-quiz',label: 'Rich or Poor?',href: 'perception-quiz.html',    icon: 'question' },
    { id: 'move-quiz',      label: 'Move Quiz',    href: 'move-quiz.html',           icon: 'compass' },
],
```

---

### Keep It Clean

1. **Consistent patterns**: Uses the same IIFE structure as `move-quiz.js`
2. **Configuration-driven**: All questions and messages in `CONFIG.perceptionQuiz`
3. **Uses existing utilities**: `UI._esc()`, `UI.toast()` for consistency
4. **No external dependencies**: Pure vanilla JS
5. **Responsive design**: CSS grid with mobile breakpoints
6. **Shareable**: Uses Web Share API with clipboard fallback

---

### Watch Out For

1. **Question accuracy**: All stats must be verifiable. Double-check each figure against Eurostat or cited source before shipping. Out-of-date stats undermine credibility.

2. **Option balance**: Each question needs 4 plausible options. If one is obviously wrong, the quiz becomes too easy. Test with users who don't know the answers.

3. **Explanation quality**: The "why it's surprising" explanation is the educational value. Don't just state the answer — explain the stereotype it defies.

4. **Mobile option sizing**: 4 country buttons need to fit on narrow screens. The responsive CSS handles this, but test on actual devices.

5. **No persistence**: Currently, refreshing the page resets the quiz. Consider saving progress to `localStorage` if users complain about losing progress.

6. **Score sharing**: The share text is plain text. For viral sharing, consider generating a shareable image card (like the superpower download) with the score.

7. **Question order**: Currently fixed order. Consider shuffling questions for replay value:
   ```javascript
   // Add to init:
   var shuffled = questions.slice().sort(() => Math.random() - 0.5);
   ```

---

## Summary

| Feature | Files to Create | Files to Modify | Effort |
|---------|-----------------|-----------------|--------|
| Country Superpowers | `superpowers.html`, `js/superpowers.js` | `config.js`, `style.css` | 1-2 days |
| Rich or Poor Quiz | `perception-quiz.html`, `js/perception-quiz.js` | `config.js`, `style.css` | 2-3 days |

Both features follow existing patterns and require no new dependencies. They integrate cleanly with the existing navigation and design system.
