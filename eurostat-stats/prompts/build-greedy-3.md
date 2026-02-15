# Build Guide: Greedy Ideas Round 3 — Selected Features

This guide provides step-by-step implementation instructions for two features from the Round 3 ideas list. Each section is self-contained — you can implement either feature independently.

---

## Project Context

**Tech Stack:**
- Vanilla JavaScript (ES6+), HTML5, CSS3
- Chart.js with annotation plugin
- Bootstrap 5.3.3
- No build tools — pure client-side static hosting
- localStorage for persistence and caching
- Eurostat REST API for data

**Key Files:**
- `index.html` — Main explorer page
- `dashboard.html` — Themed dashboard pages
- `js/config.js` — Central configuration, datasets, constants
- `js/main.js` — Data fetching logic
- `js/ui.js` — UI utilities, export functions, toast notifications
- `js/charts.js` — Chart rendering
- `css/style.css` — All styling

---

## Idea 6: "Where Should I Move?" Decision Engine

**What:** Answer 5 questions about your priorities (weather, cost, jobs, safety, culture). Get a ranked list of EU countries that match your preferences, backed by Eurostat data.

### Assessment: WORTH IT — High impact, medium effort

- **Effort:** Min 2 days, Max 4 days
- **What exists:** Eurostat data fetching, country display patterns, share URL generation, localStorage persistence. The Signal Feed and dashboard patterns provide templates for ranked results display.
- **Technical approach:** New page with quiz UI, client-side scoring against pre-fetched country metrics, results display with match percentages.
- **Main constraint:** Need to map abstract preferences (warm weather, low cost) to specific Eurostat indicators. Some data (like weather) isn't in Eurostat — use proxy metrics or hardcode reasonable values.
- **Easier than it looks:** The scoring algorithm is simple weighted sums. Most complexity is in the UI polish, not the logic.

---

### Overview

Build a single-page quiz that asks 5 preference questions, then ranks EU countries by how well they match. Each question maps to one or more Eurostat indicators. Results show top 3 matches with percentage scores and key stats.

---

### Steps

#### 1. Create the page file

Create `move-quiz.html` in the root directory. Use `index.html` as a template — copy the head section (meta tags, Bootstrap, Chart.js, custom CSS) and footer structure. Strip out the explorer-specific content.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Copy meta/link/script tags from index.html head -->
  <title>Where Should I Move? | Eurostat Explorer</title>
</head>
<body>
  <div class="container py-4">
    <header class="text-center mb-4">
      <h1>Where Should I Move?</h1>
      <p class="lead">Answer 5 questions. Get your EU country match.</p>
    </header>

    <main id="quizContainer">
      <!-- Quiz form goes here -->
    </main>

    <section id="resultsContainer" style="display:none;">
      <!-- Results display goes here -->
    </section>
  </div>

  <script src="js/config.js"></script>
  <script src="js/cache.js"></script>
  <script src="js/main.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/move-quiz.js"></script>
</body>
</html>
```

#### 2. Define question configuration in config.js

Add a new `CONFIG.moveQuiz` object at the end of `config.js`:

```javascript
CONFIG.moveQuiz = {
  questions: [
    {
      id: 'weather',
      label: 'Weather preference',
      description: 'Do you prefer warm Mediterranean climate or cooler northern weather?',
      type: 'slider',
      minLabel: 'Cool & rainy',
      maxLabel: 'Warm & sunny',
      weight: 0.2
    },
    {
      id: 'cost',
      label: 'Cost of living',
      description: 'How important is a low cost of living to you?',
      type: 'slider',
      minLabel: 'Money is no object',
      maxLabel: 'Budget is key',
      weight: 0.25
    },
    {
      id: 'career',
      label: 'Career vs lifestyle',
      description: 'What matters more — career opportunities or work-life balance?',
      type: 'slider',
      minLabel: 'Career growth',
      maxLabel: 'Work-life balance',
      weight: 0.2
    },
    {
      id: 'urban',
      label: 'City vs nature',
      description: 'Do you prefer urban life or access to nature?',
      type: 'slider',
      minLabel: 'Big city energy',
      maxLabel: 'Nature & space',
      weight: 0.15
    },
    {
      id: 'english',
      label: 'English friendliness',
      description: 'How important is it that locals speak English?',
      type: 'slider',
      minLabel: 'I\'ll learn the language',
      maxLabel: 'English is essential',
      weight: 0.2
    }
  ],

  // Country scores for each dimension (0-100, higher = more of that trait)
  // These are derived from Eurostat data + reasonable estimates
  countryScores: {
    AT: { weather: 35, cost: 30, career: 55, urban: 50, english: 60, name: 'Austria', flag: '🇦🇹' },
    BE: { weather: 30, cost: 35, career: 65, urban: 75, english: 70, name: 'Belgium', flag: '🇧🇪' },
    BG: { weather: 55, cost: 90, career: 30, urban: 40, english: 35, name: 'Bulgaria', flag: '🇧🇬' },
    HR: { weather: 70, cost: 75, career: 35, urban: 35, english: 50, name: 'Croatia', flag: '🇭🇷' },
    CY: { weather: 95, cost: 50, career: 40, urban: 45, english: 85, name: 'Cyprus', flag: '🇨🇾' },
    CZ: { weather: 30, cost: 65, career: 50, urban: 55, english: 45, name: 'Czechia', flag: '🇨🇿' },
    DK: { weather: 20, cost: 20, career: 60, urban: 60, english: 90, name: 'Denmark', flag: '🇩🇰' },
    EE: { weather: 15, cost: 55, career: 55, urban: 40, english: 75, name: 'Estonia', flag: '🇪🇪' },
    FI: { weather: 10, cost: 35, career: 55, urban: 35, english: 85, name: 'Finland', flag: '🇫🇮' },
    FR: { weather: 55, cost: 40, career: 60, urban: 65, english: 40, name: 'France', flag: '🇫🇷' },
    DE: { weather: 30, cost: 45, career: 75, urban: 70, english: 65, name: 'Germany', flag: '🇩🇪' },
    EL: { weather: 90, cost: 60, career: 25, urban: 45, english: 55, name: 'Greece', flag: '🇬🇷' },
    HU: { weather: 45, cost: 80, career: 40, urban: 50, english: 40, name: 'Hungary', flag: '🇭🇺' },
    IE: { weather: 25, cost: 25, career: 70, urban: 55, english: 100, name: 'Ireland', flag: '🇮🇪' },
    IT: { weather: 75, cost: 50, career: 45, urban: 60, english: 35, name: 'Italy', flag: '🇮🇹' },
    LV: { weather: 20, cost: 65, career: 40, urban: 45, english: 55, name: 'Latvia', flag: '🇱🇻' },
    LT: { weather: 20, cost: 70, career: 45, urban: 45, english: 50, name: 'Lithuania', flag: '🇱🇹' },
    LU: { weather: 30, cost: 15, career: 70, urban: 70, english: 75, name: 'Luxembourg', flag: '🇱🇺' },
    MT: { weather: 95, cost: 55, career: 45, urban: 85, english: 95, name: 'Malta', flag: '🇲🇹' },
    NL: { weather: 25, cost: 30, career: 70, urban: 80, english: 95, name: 'Netherlands', flag: '🇳🇱' },
    PL: { weather: 30, cost: 75, career: 50, urban: 55, english: 45, name: 'Poland', flag: '🇵🇱' },
    PT: { weather: 85, cost: 65, career: 35, urban: 50, english: 55, name: 'Portugal', flag: '🇵🇹' },
    RO: { weather: 50, cost: 85, career: 35, urban: 40, english: 40, name: 'Romania', flag: '🇷🇴' },
    SK: { weather: 35, cost: 70, career: 45, urban: 45, english: 45, name: 'Slovakia', flag: '🇸🇰' },
    SI: { weather: 50, cost: 55, career: 45, urban: 40, english: 60, name: 'Slovenia', flag: '🇸🇮' },
    ES: { weather: 85, cost: 55, career: 40, urban: 65, english: 40, name: 'Spain', flag: '🇪🇸' },
    SE: { weather: 15, cost: 30, career: 60, urban: 50, english: 90, name: 'Sweden', flag: '🇸🇪' }
  }
};
```

#### 3. Create the quiz JavaScript file

Create `js/move-quiz.js`:

```javascript
(function() {
  'use strict';

  var quizState = {
    responses: {},      // { questionId: value 0-100 }
    results: null       // calculated after submission
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    renderQuiz();
    checkUrlForResults();
  });

  function renderQuiz() {
    var container = document.getElementById('quizContainer');
    var questions = CONFIG.moveQuiz.questions;

    var html = '<form id="quizForm" class="card p-4">';

    questions.forEach(function(q, i) {
      var stepNum = i + 1;
      html += '<div class="quiz-question mb-4">';
      html += '<h5 class="mb-2">' + stepNum + '. ' + UI._esc(q.label) + '</h5>';
      html += '<p class="text-muted small mb-3">' + UI._esc(q.description) + '</p>';
      html += '<div class="d-flex align-items-center gap-3">';
      html += '<span class="text-muted small" style="min-width:100px;">' + UI._esc(q.minLabel) + '</span>';
      html += '<input type="range" class="form-range flex-grow-1" id="q_' + q.id + '" ';
      html += 'min="0" max="100" value="50" data-qid="' + q.id + '">';
      html += '<span class="text-muted small" style="min-width:100px;text-align:right;">' + UI._esc(q.maxLabel) + '</span>';
      html += '</div>';
      html += '</div>';
    });

    html += '<button type="submit" class="btn btn-primary btn-lg w-100 mt-3">Find My Match</button>';
    html += '</form>';

    container.innerHTML = html;

    // Attach submit handler
    document.getElementById('quizForm').addEventListener('submit', handleSubmit);
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Collect responses
    CONFIG.moveQuiz.questions.forEach(function(q) {
      var input = document.getElementById('q_' + q.id);
      quizState.responses[q.id] = parseInt(input.value, 10);
    });

    // Calculate matches
    quizState.results = calculateMatches(quizState.responses);

    // Show results
    renderResults(quizState.results);

    // Update URL for sharing
    updateShareUrl();
  }

  function calculateMatches(responses) {
    var questions = CONFIG.moveQuiz.questions;
    var countries = CONFIG.moveQuiz.countryScores;
    var results = [];

    Object.keys(countries).forEach(function(code) {
      var country = countries[code];
      var score = 0;
      var maxScore = 0;

      questions.forEach(function(q) {
        var userPref = responses[q.id];        // 0-100
        var countryVal = country[q.id];        // 0-100
        var weight = q.weight;

        // Calculate how well country matches preference
        // 100 = perfect match, 0 = complete mismatch
        var diff = Math.abs(userPref - countryVal);
        var match = 100 - diff;

        score += match * weight;
        maxScore += 100 * weight;
      });

      var percentage = Math.round((score / maxScore) * 100);

      results.push({
        code: code,
        name: country.name,
        flag: country.flag,
        score: percentage,
        traits: country
      });
    });

    // Sort by score descending
    results.sort(function(a, b) { return b.score - a.score; });

    return results;
  }

  function renderResults(results) {
    var container = document.getElementById('resultsContainer');
    var top3 = results.slice(0, 3);

    var html = '<div class="card p-4">';
    html += '<h2 class="text-center mb-4">Your Top Matches</h2>';

    top3.forEach(function(match, i) {
      var rank = i + 1;
      var bgClass = i === 0 ? 'bg-success bg-opacity-10' : '';

      html += '<div class="match-card d-flex align-items-center p-3 mb-3 rounded ' + bgClass + '" style="border:1px solid #dee2e6;">';
      html += '<span class="fs-2 me-3">' + match.flag + '</span>';
      html += '<div class="flex-grow-1">';
      html += '<h4 class="mb-1">#' + rank + ' ' + UI._esc(match.name) + '</h4>';
      html += '<div class="progress" style="height:24px;">';
      html += '<div class="progress-bar bg-primary" style="width:' + match.score + '%;">';
      html += match.score + '% match</div></div>';
      html += '</div>';
      html += '</div>';
    });

    // Share button
    html += '<div class="text-center mt-4">';
    html += '<button id="shareResultsBtn" class="btn btn-outline-primary">';
    html += 'Share My Results</button>';
    html += '</div>';

    // Show all countries toggle
    html += '<details class="mt-4">';
    html += '<summary class="btn btn-link">See all countries ranked</summary>';
    html += '<div class="mt-3">';
    results.forEach(function(match, i) {
      html += '<div class="d-flex justify-content-between py-1 border-bottom">';
      html += '<span>' + match.flag + ' ' + UI._esc(match.name) + '</span>';
      html += '<span class="text-muted">' + match.score + '%</span>';
      html += '</div>';
    });
    html += '</div></details>';

    html += '</div>';

    container.innerHTML = html;
    container.style.display = 'block';

    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth' });

    // Attach share handler
    document.getElementById('shareResultsBtn').addEventListener('click', copyShareUrl);
  }

  function updateShareUrl() {
    var params = new URLSearchParams();
    CONFIG.moveQuiz.questions.forEach(function(q) {
      params.set(q.id, quizState.responses[q.id]);
    });
    var newUrl = window.location.pathname + '?' + params.toString();
    history.replaceState(null, '', newUrl);
  }

  function copyShareUrl() {
    var url = window.location.href;
    navigator.clipboard.writeText(url).then(function() {
      UI.toast('Link copied to clipboard!', 'success');
    }).catch(function() {
      UI.toast('Could not copy link', 'error');
    });
  }

  function checkUrlForResults() {
    var params = new URLSearchParams(window.location.search);
    var hasParams = false;

    CONFIG.moveQuiz.questions.forEach(function(q) {
      var val = params.get(q.id);
      if (val !== null) {
        hasParams = true;
        quizState.responses[q.id] = parseInt(val, 10);
        // Update slider to match
        var input = document.getElementById('q_' + q.id);
        if (input) input.value = val;
      }
    });

    if (hasParams) {
      quizState.results = calculateMatches(quizState.responses);
      renderResults(quizState.results);
    }
  }
})();
```

#### 4. Add CSS for quiz styling

Add to `css/style.css`:

```css
/* Move Quiz Styles */
.quiz-question {
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}
.quiz-question:last-of-type {
  border-bottom: none;
}
.match-card {
  transition: transform 0.15s ease;
}
.match-card:hover {
  transform: translateX(4px);
}
```

#### 5. Add navigation link

In `index.html` and `dashboard.html`, add a link to the quiz in the navigation or footer:

```html
<a href="move-quiz.html" class="btn btn-outline-secondary">Where Should I Move?</a>
```

---

### Keep it clean

- The quiz is in its own page and JS file — no pollution of existing code
- Country scores are in `CONFIG` so they're easy to update with real data later
- The scoring algorithm is a simple weighted sum — easy to enhance without refactoring
- Share URL uses same pattern as explorer share functionality

---

### Watch out for

- **Country score accuracy:** The hardcoded scores are estimates. For production, pull actual indicators from Eurostat (unemployment rate, GDP per capita, etc.) and normalize them to 0-100 scales.
- **Missing countries:** The list includes EU27 minus a few microstates. Update as needed.
- **Mobile UX:** Test slider interactions on mobile — they can be fiddly. Consider adding number displays next to sliders.
- **Edge case:** If user shares URL with invalid params, the sliders might show wrong values. Add validation.

---

## Idea 10: "Make It Viral" Card Generator

**What:** Tool to turn any chart into a perfectly formatted, social-media-optimized shareable card. Choose template, add title, export in 1080x1080 or 16:9.

### Assessment: WORTH IT — High impact, medium effort

- **Effort:** Min 1 day, Max 3 days
- **What exists:** Chart.js rendering, PNG export via `toBase64Image()`, share URL generation. The infrastructure for exporting is there.
- **Technical approach:** Use Canvas API to composite chart image with styled template overlays (title, watermark, border). Generate at fixed social dimensions.
- **Main constraint:** Chart.js's `toBase64Image()` outputs the chart at rendered size. Need to re-render or scale to hit exact social dimensions (1080x1080, 1200x628).
- **Easier than it looks:** Canvas compositing is straightforward. Most work is in template design and sizing math.

---

### Overview

Add a "Make Card" button to chart action bars. When clicked, open a modal with template options and size selector. Render the chart into a styled card template at the selected dimensions. Download as PNG.

---

### Steps

#### 1. Add card template configuration to config.js

Add at the end of `config.js`:

```javascript
CONFIG.cardTemplates = [
  {
    id: 'clean',
    name: 'Clean',
    bgColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#0d6efd',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'bold',
    name: 'Bold',
    bgColor: '#1a1a2e',
    textColor: '#ffffff',
    accentColor: '#e94560',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'dark',
    name: 'Dark',
    bgColor: '#0f0f0f',
    textColor: '#f0f0f0',
    accentColor: '#00d4ff',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }
];

CONFIG.cardSizes = [
  { id: 'square', name: 'Square (1080x1080)', width: 1080, height: 1080, label: 'Instagram' },
  { id: 'landscape', name: 'Landscape (1200x628)', width: 1200, height: 628, label: 'Twitter/LinkedIn' }
];
```

#### 2. Add card generator functions to ui.js

Add these functions to `js/ui.js` (before the closing of the UI object or at the end):

```javascript
UI.cardGenerator = {

  // Generate the card as a canvas element
  generate: function(chartInstance, options) {
    var template = options.template;
    var size = options.size;
    var title = options.title || 'Eurostat Data';
    var subtitle = options.subtitle || '';

    // Create off-screen canvas at target size
    var canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = template.bgColor;
    ctx.fillRect(0, 0, size.width, size.height);

    // Calculate layout
    var padding = Math.round(size.width * 0.05);
    var titleHeight = Math.round(size.height * 0.12);
    var footerHeight = Math.round(size.height * 0.08);
    var chartAreaTop = titleHeight + padding;
    var chartAreaHeight = size.height - titleHeight - footerHeight - (padding * 2);
    var chartAreaWidth = size.width - (padding * 2);

    // Draw title
    ctx.fillStyle = template.textColor;
    ctx.font = 'bold ' + Math.round(size.height * 0.04) + 'px ' + template.fontFamily;
    ctx.textAlign = 'center';
    ctx.fillText(title, size.width / 2, titleHeight * 0.6);

    // Draw subtitle if present
    if (subtitle) {
      ctx.font = Math.round(size.height * 0.025) + 'px ' + template.fontFamily;
      ctx.fillStyle = template.textColor;
      ctx.globalAlpha = 0.7;
      ctx.fillText(subtitle, size.width / 2, titleHeight * 0.85);
      ctx.globalAlpha = 1;
    }

    // Draw accent line under title
    ctx.fillStyle = template.accentColor;
    var lineWidth = size.width * 0.3;
    ctx.fillRect((size.width - lineWidth) / 2, titleHeight, lineWidth, 3);

    // Get chart as image and draw it
    var chartImg = new Image();
    var chartDataUrl = chartInstance.toBase64Image();

    return new Promise(function(resolve) {
      chartImg.onload = function() {
        // Calculate scaling to fit chart in available area
        var scale = Math.min(
          chartAreaWidth / chartImg.width,
          chartAreaHeight / chartImg.height
        );
        var drawWidth = chartImg.width * scale;
        var drawHeight = chartImg.height * scale;
        var drawX = (size.width - drawWidth) / 2;
        var drawY = chartAreaTop + (chartAreaHeight - drawHeight) / 2;

        ctx.drawImage(chartImg, drawX, drawY, drawWidth, drawHeight);

        // Draw footer / watermark
        ctx.fillStyle = template.textColor;
        ctx.globalAlpha = 0.5;
        ctx.font = Math.round(size.height * 0.02) + 'px ' + template.fontFamily;
        ctx.textAlign = 'center';
        ctx.fillText('eurostat-stats.example.com', size.width / 2, size.height - (footerHeight * 0.4));
        ctx.globalAlpha = 1;

        // Draw accent border
        ctx.strokeStyle = template.accentColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, size.width - 4, size.height - 4);

        resolve(canvas);
      };
      chartImg.src = chartDataUrl;
    });
  },

  // Download the generated card
  download: function(canvas, filename) {
    var link = document.createElement('a');
    link.download = filename || 'eurostat-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  },

  // Show the card generator modal
  showModal: function(chartInstance, chartTitle) {
    // Remove existing modal if present
    var existing = document.getElementById('cardGenModal');
    if (existing) existing.remove();

    var templates = CONFIG.cardTemplates;
    var sizes = CONFIG.cardSizes;

    var html = '<div class="modal fade" id="cardGenModal" tabindex="-1">';
    html += '<div class="modal-dialog modal-lg">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h5 class="modal-title">Create Shareable Card</h5>';
    html += '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>';
    html += '</div>';
    html += '<div class="modal-body">';

    // Title input
    html += '<div class="mb-3">';
    html += '<label class="form-label">Card Title</label>';
    html += '<input type="text" class="form-control" id="cardTitle" value="' + UI._esc(chartTitle || '') + '">';
    html += '</div>';

    // Subtitle input
    html += '<div class="mb-3">';
    html += '<label class="form-label">Subtitle (optional)</label>';
    html += '<input type="text" class="form-control" id="cardSubtitle" placeholder="e.g., Source: Eurostat 2024">';
    html += '</div>';

    // Template selector
    html += '<div class="mb-3">';
    html += '<label class="form-label">Template</label>';
    html += '<div class="d-flex gap-2">';
    templates.forEach(function(t, i) {
      var checked = i === 0 ? 'checked' : '';
      html += '<label class="card p-2 text-center" style="cursor:pointer;min-width:80px;">';
      html += '<input type="radio" name="cardTemplate" value="' + t.id + '" ' + checked + ' class="d-none">';
      html += '<div class="rounded mb-1" style="height:30px;background:' + t.bgColor + ';border:2px solid ' + t.accentColor + ';"></div>';
      html += '<small>' + UI._esc(t.name) + '</small>';
      html += '</label>';
    });
    html += '</div></div>';

    // Size selector
    html += '<div class="mb-3">';
    html += '<label class="form-label">Size</label>';
    html += '<div class="d-flex gap-2">';
    sizes.forEach(function(s, i) {
      var checked = i === 0 ? 'checked' : '';
      html += '<label class="btn btn-outline-secondary">';
      html += '<input type="radio" name="cardSize" value="' + s.id + '" ' + checked + ' class="d-none"> ';
      html += UI._esc(s.label);
      html += '</label>';
    });
    html += '</div></div>';

    // Preview area
    html += '<div class="mb-3">';
    html += '<label class="form-label">Preview</label>';
    html += '<div id="cardPreview" class="border rounded p-2 text-center bg-light" style="min-height:200px;">';
    html += '<span class="text-muted">Click "Generate Preview" to see your card</span>';
    html += '</div></div>';

    html += '</div>'; // modal-body

    html += '<div class="modal-footer">';
    html += '<button type="button" class="btn btn-secondary" id="cardPreviewBtn">Generate Preview</button>';
    html += '<button type="button" class="btn btn-primary" id="cardDownloadBtn" disabled>Download PNG</button>';
    html += '</div>';

    html += '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);

    var modal = new bootstrap.Modal(document.getElementById('cardGenModal'));
    var generatedCanvas = null;

    // Preview button handler
    document.getElementById('cardPreviewBtn').addEventListener('click', function() {
      var templateId = document.querySelector('input[name="cardTemplate"]:checked').value;
      var sizeId = document.querySelector('input[name="cardSize"]:checked').value;
      var template = templates.find(function(t) { return t.id === templateId; });
      var size = sizes.find(function(s) { return s.id === sizeId; });
      var title = document.getElementById('cardTitle').value;
      var subtitle = document.getElementById('cardSubtitle').value;

      UI.cardGenerator.generate(chartInstance, {
        template: template,
        size: size,
        title: title,
        subtitle: subtitle
      }).then(function(canvas) {
        generatedCanvas = canvas;

        // Show preview (scaled down to fit)
        var previewDiv = document.getElementById('cardPreview');
        previewDiv.innerHTML = '';
        var previewImg = document.createElement('img');
        previewImg.src = canvas.toDataURL('image/png');
        previewImg.style.maxWidth = '100%';
        previewImg.style.maxHeight = '400px';
        previewDiv.appendChild(previewImg);

        document.getElementById('cardDownloadBtn').disabled = false;
      });
    });

    // Download button handler
    document.getElementById('cardDownloadBtn').addEventListener('click', function() {
      if (generatedCanvas) {
        var sizeId = document.querySelector('input[name="cardSize"]:checked').value;
        UI.cardGenerator.download(generatedCanvas, 'eurostat-card-' + sizeId + '.png');
        UI.toast('Card downloaded!', 'success');
      }
    });

    // Template selection visual feedback
    document.querySelectorAll('input[name="cardTemplate"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        document.querySelectorAll('input[name="cardTemplate"]').forEach(function(r) {
          r.closest('label').classList.remove('border-primary');
        });
        this.closest('label').classList.add('border-primary');
      });
    });

    // Size selection visual feedback
    document.querySelectorAll('input[name="cardSize"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        document.querySelectorAll('input[name="cardSize"]').forEach(function(r) {
          r.closest('label').classList.remove('active');
        });
        this.closest('label').classList.add('active');
      });
    });

    modal.show();
  }
};
```

#### 3. Add the "Make Card" button to chart action bars

In `index.html`, find the result actions area (around line 115-125) and add a new button:

```html
<button id="resultCardBtn" class="btn btn-action" title="Create shareable card" disabled>
  Card
</button>
```

In `dashboard.html`, add to the button generation in `UI.chartCardHTML()` or the chart card template (around line 280-320):

```html
<button class="btn btn-action btn-card" title="Create shareable card">Card</button>
```

#### 4. Wire up the button click handlers

In `index.html`, add to the event listeners section (after the PNG button handler):

```javascript
document.getElementById('resultCardBtn').addEventListener('click', function() {
  if (explorerState.chartInstance) {
    var title = explorerState.datasetCode ?
      (DATASETS[explorerState.datasetCode]?.name || explorerState.datasetCode) :
      'Eurostat Data';
    UI.cardGenerator.showModal(explorerState.chartInstance, title);
  }
});
```

Enable the button when a chart is rendered (in the visualization success handler):

```javascript
document.getElementById('resultCardBtn').disabled = false;
```

In `dashboard.html`, add event delegation for the card buttons:

```javascript
document.addEventListener('click', function(e) {
  var cardBtn = e.target.closest('.btn-card');
  if (cardBtn) {
    var section = cardBtn.closest('.chart-section');
    var index = section.dataset.index;
    var chartInstance = dashboardState.charts[index];
    var chartCfg = currentPageConfig.charts[index];
    if (chartInstance && chartCfg) {
      UI.cardGenerator.showModal(chartInstance, chartCfg.title);
    }
  }
});
```

#### 5. Add modal CSS

Add to `css/style.css`:

```css
/* Card Generator Modal */
#cardGenModal input[name="cardTemplate"]:checked + div {
  box-shadow: 0 0 0 3px var(--bs-primary);
}
#cardGenModal label.btn.active {
  background-color: var(--bs-primary);
  color: white;
}
#cardPreview img {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

### Keep it clean

- All card generation logic is isolated in `UI.cardGenerator` object
- Templates are config-driven — add new templates by editing `CONFIG.cardTemplates`
- Modal uses Bootstrap's modal system for consistency
- Button placement follows existing pattern of action buttons in chart headers

---

### Watch out for

- **Chart size:** The source chart may be small on screen. `toBase64Image()` captures at rendered size, which might look pixelated when scaled up. For higher quality, consider re-rendering the chart at target dimensions before capture (create hidden canvas, render chart to it at 1080px, then capture).
- **Font loading:** Canvas text won't use web fonts unless they're fully loaded. System fonts are safer.
- **CORS issues:** If you later add external images (logos, etc.), they'll taint the canvas and prevent `toDataURL()`. Keep everything local.
- **Mobile modal:** Test the modal on mobile — large canvases can cause memory issues on older phones.
- **Watermark URL:** Update `eurostat-stats.example.com` to your actual domain before launch.

---

## Summary

| Idea | Verdict | Effort | Key Files to Create/Modify |
|------|---------|--------|---------------------------|
| 6. Where Should I Move | WORTH IT | 2-4 days | `move-quiz.html`, `js/move-quiz.js`, `js/config.js` |
| 10. Card Generator | WORTH IT | 1-3 days | `js/ui.js`, `js/config.js`, `index.html`, `dashboard.html` |

Both features are independent — implement in either order. The Card Generator has broader impact (enhances all existing charts) while the Move Quiz is a standalone viral feature.
