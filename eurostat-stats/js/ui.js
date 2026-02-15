// Eurostat Stats — UI Utilities
// Toast notifications, chart card rendering, export, share URLs.

const UI = {

    // ── Toast Notifications ──────────────────────────────────

    _toastContainer: null,

    _ensureToastContainer() {
        if (this._toastContainer) return this._toastContainer;
        const c = document.createElement('div');
        c.id = 'toast-container';
        c.setAttribute('aria-live', 'polite');
        document.body.appendChild(c);
        this._toastContainer = c;
        return c;
    },

    toast(message, type) {
        type = type || 'info'; // 'info' | 'success' | 'error' | 'warning'
        const container = this._ensureToastContainer();
        const el = document.createElement('div');
        el.className = 'eurostat-toast toast-' + type;
        el.textContent = message;
        container.appendChild(el);
        // trigger enter animation
        requestAnimationFrame(function () { el.classList.add('show'); });
        setTimeout(function () {
            el.classList.remove('show');
            el.addEventListener('transitionend', function () { el.remove(); });
        }, 4000);
    },

    // ── Chart Card HTML Generator ────────────────────────────

    /**
     * Build the HTML for a chart card from a chart config object.
     * @param {Object} chartCfg — { id, title, description, url }
     * @param {number} index — chart index (1-based) on the page
     * @returns {string} HTML string for the card
     */
    chartCardHTML(chartCfg, index) {
        var safeTitle = this._esc(chartCfg.title);
        var safeDesc = this._esc(chartCfg.description || '');
        var safeUrl = this._esc(chartCfg.url);
        return (
            '<section class="card w-100 my-2 chart-section" data-chart-index="' + index + '">' +
                '<div class="card-body">' +
                    '<div class="chart-header">' +
                        '<h2 class="chart-title">' + safeTitle + '</h2>' +
                        '<div class="chart-actions">' +
                            '<button class="btn-action btn-table-toggle" title="Toggle data table" data-index="' + index + '">Table</button>' +
                            '<button class="btn-action btn-csv" title="Download CSV" data-index="' + index + '">CSV</button>' +
                            '<button class="btn-action btn-png" title="Download chart as PNG" data-index="' + index + '">PNG</button>' +
                            '<button class="btn-action btn-card" title="Create shareable card" data-index="' + index + '">Card</button>' +
                            '<button class="btn-action btn-share" title="Copy share link" data-index="' + index + '">Share</button>' +
                            '<button class="btn-action btn-explain" title="Explain this chart" data-index="' + index + '">Explain</button>' +
                        '</div>' +
                    '</div>' +
                    (safeDesc ? '<p class="chart-desc">' + safeDesc + '</p>' : '') +
                    '<div class="input-group mb-3">' +
                        '<input type="text" id="input' + index + '" class="form-control" value="' + safeUrl + '">' +
                        '<button class="btn-fetch" type="button" data-index="' + index + '">Fetch</button>' +
                    '</div>' +
                    '<div class="chart-updated text-muted" id="updated' + index + '"></div>' +
                    '<div style="position:relative;">' +
                        '<div class="loading-overlay" id="loading' + index + '">' +
                            '<div class="loading-spinner"></div>' +
                        '</div>' +
                        '<canvas id="chart' + index + '" width="400" height="200"></canvas>' +
                    '</div>' +
                    '<div class="data-table-wrapper" id="table' + index + '" style="display:none;"></div>' +
                    '<div class="chart-explain" id="explain' + index + '" style="display:none;"></div>' +
                '</div>' +
            '</section>'
        );
    },

    // ── Navigation Builder ───────────────────────────────────

    /**
     * Render the <nav> with all pages from CONFIG.pages, marking the active one.
     * @param {string} activeId — e.g. 'economy', 'index'
     * @returns {string} HTML for <nav>
     */
    navHTML(activeId) {
        var items = (typeof CONFIG !== 'undefined' && CONFIG.pages) ? CONFIG.pages : [];
        var html = '<ul class="nav justify-content-center">';
        for (var i = 0; i < items.length; i++) {
            var p = items[i];
            var cls = p.id === activeId ? ' active' : '';
            html += '<li class="nav-item"><a class="nav-link' + cls + '" href="' + this._esc(p.href) + '">' + this._esc(p.label) + '</a></li>';
        }
        html += '</ul>';
        return html;
    },

    // ── Data Table Rendering ─────────────────────────────────

    /**
     * Render a sortable HTML table from chart data.
     * @param {Object} data — { data: [{geo, time, value}], label }
     * @returns {string} HTML table
     */
    dataTableHTML(data) {
        if (!data || !data.data || !data.data.length) return '<p class="text-muted">No data to display.</p>';
        var rows = data.data.slice().sort(function (a, b) {
            return a.geo.localeCompare(b.geo) || String(a.time).localeCompare(String(b.time));
        });
        var html = '<table class="table table-sm table-bordered table-striped eurostat-data-table">' +
            '<thead><tr><th>Country</th><th>Year</th><th>Value</th></tr></thead><tbody>';
        for (var i = 0; i < rows.length; i++) {
            html += '<tr><td>' + this._esc(rows[i].geo) + '</td><td>' + this._esc(String(rows[i].time)) + '</td><td>' + this._esc(String(rows[i].value)) + '</td></tr>';
        }
        html += '</tbody></table>';
        return html;
    },

    // ── CSV Export ────────────────────────────────────────────

    downloadCSV(data, filename) {
        if (!data || !data.data) return;
        var lines = ['Country,Year,Value'];
        data.data.forEach(function (r) {
            lines.push('"' + r.geo + '",' + r.time + ',' + r.value);
        });
        var blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (filename || 'eurostat_data') + '.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ── PNG Export ────────────────────────────────────────────

    downloadPNG(chartInstance, filename) {
        if (!chartInstance) return;
        var a = document.createElement('a');
        a.href = chartInstance.toBase64Image();
        a.download = (filename || 'eurostat_chart') + '.png';
        a.click();
    },

    // ── Share URL ────────────────────────────────────────────

    buildShareUrl(stateOrUrl) {
        var base = window.location.origin + window.location.pathname;
        if (typeof stateOrUrl === 'string') {
            return base + '?url=' + encodeURIComponent(stateOrUrl);
        }
        if (stateOrUrl && typeof stateOrUrl === 'object' && stateOrUrl.dataset) {
            var params = new URLSearchParams();
            params.set('dataset', stateOrUrl.dataset);
            if (Array.isArray(stateOrUrl.geo) && stateOrUrl.geo.length) {
                params.set('geo', stateOrUrl.geo.join(','));
            }
            if (stateOrUrl.type) {
                params.set('type', stateOrUrl.type);
            }
            if (Array.isArray(stateOrUrl.events) && stateOrUrl.events.length) {
                params.set('events', stateOrUrl.events.join(','));
            }
            if (stateOrUrl.majorOnly === false) {
                params.set('major', '0');
            }
            return base + '?' + params.toString();
        }
        if (stateOrUrl && typeof stateOrUrl === 'object' && stateOrUrl.url) {
            return base + '?url=' + encodeURIComponent(stateOrUrl.url);
        }
        return base;
    },

    copyShareUrl(stateOrUrl) {
        var url = this.buildShareUrl(stateOrUrl);
        navigator.clipboard.writeText(url).then(
            function () { UI.toast('Share link copied!', 'success'); },
            function () { UI.toast('Could not copy link.', 'error'); }
        );
    },

    // ── Explain + Signals ─────────────────────────────────────

    buildChartExplanation(data, datasetCode, options) {
        options = options || {};
        var meta = (typeof DATASETS !== 'undefined' && datasetCode && DATASETS[datasetCode]) ? DATASETS[datasetCode] : null;
        var title = (meta && meta.name) || (data && (data.preferredLabel || data.label)) || 'This indicator';
        var why = (meta && meta.description) || 'It helps compare long-term trends across countries.';

        if (!data || !Array.isArray(data.data) || data.data.length < 2) {
            return title + ' provides a comparable view of how countries evolve over time. Why it matters: ' + why + ' Caveat: always compare the same unit and filter selection.';
        }

        var grouped = {};
        for (var i = 0; i < data.data.length; i++) {
            var row = data.data[i];
            if (!grouped[row.geo]) grouped[row.geo] = [];
            grouped[row.geo].push(row);
        }

        var best = null;
        for (var geo in grouped) {
            if (!grouped.hasOwnProperty(geo)) continue;
            var rows = grouped[geo].slice().sort(function (a, b) {
                return String(a.time).localeCompare(String(b.time));
            });
            if (rows.length < 2) continue;
            var latest = Number(rows[rows.length - 1].value);
            var prev = Number(rows[rows.length - 2].value);
            if (!isFinite(latest) || !isFinite(prev) || prev === 0) continue;
            var pct = ((latest - prev) / Math.abs(prev)) * 100;
            if (!best || Math.abs(pct) > Math.abs(best.pct)) {
                best = {
                    geo: geo,
                    latest: latest,
                    prev: prev,
                    latestYear: rows[rows.length - 1].time,
                    prevYear: rows[rows.length - 2].time,
                    pct: pct,
                };
            }
        }

        var trendSentence = '';
        if (best) {
            var direction = best.pct >= 0 ? 'up' : 'down';
            trendSentence = best.geo + ' is ' + direction + ' ' + Math.abs(best.pct).toFixed(1) +
                '% (' + best.prevYear + '→' + best.latestYear + ', latest value ' + best.latest.toLocaleString() + ').';
        } else {
            trendSentence = 'Latest values are available, but there is not enough consecutive numeric history for a robust year-on-year change.';
        }

        return title + ' tracks this measure across countries and years. ' +
            trendSentence + ' Why it matters: ' + why + ' Caveat: check units and definitions before drawing conclusions.';
    },

    buildSignalItems(data, datasetCode) {
        if (!data || !Array.isArray(data.data) || !data.data.length) return [];
        var threshold = (typeof CONFIG !== 'undefined' && CONFIG.signalFeed && typeof CONFIG.signalFeed.yoyThresholdPct === 'number')
            ? CONFIG.signalFeed.yoyThresholdPct
            : 2;
        var maxItems = (typeof CONFIG !== 'undefined' && CONFIG.signalFeed && typeof CONFIG.signalFeed.maxItems === 'number')
            ? CONFIG.signalFeed.maxItems
            : 5;
        var datasetName = (typeof DATASETS !== 'undefined' && datasetCode && DATASETS[datasetCode])
            ? DATASETS[datasetCode].name
            : (data.preferredLabel || data.label || 'Indicator');

        var grouped = {};
        for (var i = 0; i < data.data.length; i++) {
            var row = data.data[i];
            if (!grouped[row.geo]) grouped[row.geo] = [];
            grouped[row.geo].push(row);
        }

        var signals = [];
        for (var geo in grouped) {
            if (!grouped.hasOwnProperty(geo)) continue;
            var rows = grouped[geo].slice().sort(function (a, b) {
                return String(a.time).localeCompare(String(b.time));
            });
            if (rows.length < 2) continue;
            var latest = Number(rows[rows.length - 1].value);
            var prev = Number(rows[rows.length - 2].value);
            if (!isFinite(latest) || !isFinite(prev) || prev === 0) continue;
            var pct = ((latest - prev) / Math.abs(prev)) * 100;
            if (Math.abs(pct) < threshold) continue;
            signals.push({
                id: datasetCode + '_' + geo + '_' + rows[rows.length - 1].time,
                absChange: Math.abs(pct),
                text: geo + ': ' + datasetName + ' changed ' + (pct >= 0 ? '+' : '') + pct.toFixed(1) +
                    '% in ' + rows[rows.length - 1].time + ' (YoY).',
            });
        }

        signals.sort(function (a, b) { return b.absChange - a.absChange; });
        return signals.slice(0, maxItems);
    },

    signalFeedHTML(items, emptyText) {
        if (!Array.isArray(items) || !items.length) {
            return '<p class="text-muted mb-0">' + this._esc(emptyText || 'No notable updates yet.') + '</p>';
        }
        var html = '<ul class="signal-feed-list">';
        for (var i = 0; i < items.length; i++) {
            html += '<li class="signal-feed-item">' + this._esc(items[i].text) + '</li>';
        }
        html += '</ul>';
        return html;
    },

    // ── Helpers ──────────────────────────────────────────────

    _esc(str) {
        var el = document.createElement('span');
        el.textContent = str || '';
        return el.innerHTML;
    },
};

// ── Card Generator ───────────────────────────────────────────
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
                ctx.fillText('Eurostat Explorer', size.width / 2, size.height - (footerHeight * 0.4));
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
            html += '<label class="card p-2 text-center card-template-option" style="cursor:pointer;min-width:80px;">';
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
            html += '<label class="btn btn-outline-secondary card-size-option">';
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
                document.querySelectorAll('.card-template-option').forEach(function(label) {
                    label.classList.remove('border-primary');
                });
                this.closest('label').classList.add('border-primary');
            });
        });

        // Size selection visual feedback
        document.querySelectorAll('input[name="cardSize"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                document.querySelectorAll('.card-size-option').forEach(function(label) {
                    label.classList.remove('active');
                });
                this.closest('label').classList.add('active');
            });
        });

        // Set initial active state
        document.querySelector('.card-template-option').classList.add('border-primary');
        document.querySelector('.card-size-option').classList.add('active');

        modal.show();
    }
};
