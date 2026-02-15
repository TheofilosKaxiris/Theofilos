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
