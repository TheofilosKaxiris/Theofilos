// Eurostat Stats — Chart Rendering
// Supports line, bar, grouped-bar, and stacked-area chart types.

function renderEurostatChart(data, element, chart, options) {
    if (!data || !Array.isArray(data.data) || !data.data.length) return chart;

    options = options || {};
    var chartType = options.chartType || 'line';

    var ctx = document.getElementById(element);
    if (!ctx) return chart;
    ctx = ctx.getContext('2d');

    // Destroy previous chart instance
    if (chart) chart.destroy();

    var countries = [];
    var countrySet = {};
    var years = [];
    var yearSet = {};
    for (var i = 0; i < data.data.length; i++) {
        var item = data.data[i];
        if (!countrySet[item.geo]) { countrySet[item.geo] = true; countries.push(item.geo); }
        if (!yearSet[item.time]) { yearSet[item.time] = true; years.push(item.time); }
    }
    years.sort();

    var useColors = (typeof CONFIG !== 'undefined' && CONFIG.colors)
        ? CONFIG.colors
        : { getColor: function (i) { return 'hsl(' + ((i * 60) % 360) + ', 70%, 45%)'; } };

    var datasets = countries.map(function (country, idx) {
        var color = useColors.getColor(idx);
        var values = years.map(function (year) {
            var entry = data.data.find(function (d) { return d.geo === country && d.time === year; });
            return entry ? Number(entry.value) : null;
        });

        var ds = {
            label: country,
            data: values,
            borderColor: color,
            backgroundColor: color,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
        };

        // Chart-type-specific overrides
        if (chartType === 'bar' || chartType === 'grouped-bar') {
            ds.backgroundColor = color + 'cc'; // slight transparency
            ds.borderWidth = 1;
            ds.tension = undefined;
            ds.pointRadius = undefined;
            ds.fill = undefined;
        }
        if (chartType === 'stacked-area') {
            ds.fill = true;
            ds.backgroundColor = color + '44';
        }

        return ds;
    });

    var chartJsType = (chartType === 'bar' || chartType === 'grouped-bar') ? 'bar' : 'line';

    var scaleOpts = {
        y: {
            beginAtZero: chartType === 'bar' || chartType === 'grouped-bar',
            title: { display: true, text: 'Value' },
            stacked: chartType === 'stacked-area',
        },
        x: {
            title: { display: true, text: 'Year' },
            stacked: chartType === 'stacked-area',
        },
    };

    return new Chart(ctx, {
        type: chartJsType,
        data: { labels: years, datasets: datasets },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: data.label },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var val = context.parsed.y;
                            if (val === null || val === undefined) return context.dataset.label + ': N/A';
                            return context.dataset.label + ': ' + val.toLocaleString();
                        },
                    },
                },
            },
            scales: scaleOpts,
        },
    });
}
