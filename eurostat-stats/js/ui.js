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
                            '<button class="btn-action btn-share" title="Copy share link" data-index="' + index + '">Share</button>' +
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

    buildShareUrl(eurostatApiUrl) {
        var base = window.location.origin + window.location.pathname;
        return base + '?url=' + encodeURIComponent(eurostatApiUrl);
    },

    copyShareUrl(eurostatApiUrl) {
        var url = this.buildShareUrl(eurostatApiUrl);
        navigator.clipboard.writeText(url).then(
            function () { UI.toast('Share link copied!', 'success'); },
            function () { UI.toast('Could not copy link.', 'error'); }
        );
    },

    // ── Helpers ──────────────────────────────────────────────

    _esc(str) {
        var el = document.createElement('span');
        el.textContent = str || '';
        return el.innerHTML;
    },
};
