// Eurostat Stats — Chart Rendering
// Supports line, bar, grouped-bar, and stacked-area chart types.

var annotationPluginRegistered = false;

function registerAnnotationPlugin() {
    if (annotationPluginRegistered || typeof Chart === 'undefined' || typeof window === 'undefined') return;
    var plugin = window['chartjs-plugin-annotation'] || window.ChartAnnotation;
    if (!plugin) return;
    Chart.register(plugin);
    annotationPluginRegistered = true;
}

function getChartTitle(data, options) {
    if (options && options.chartTitle) return options.chartTitle;
    if (data && data.preferredLabel) return data.preferredLabel;
    if (data && data.label) return data.label;
    return 'Chart';
}

function getYAxisLabel(data, options) {
    if (options && options.yAxisLabel) return options.yAxisLabel;
    if (typeof CONFIG !== 'undefined' && CONFIG.unitLabels && data && data.unitCode && CONFIG.unitLabels[data.unitCode]) {
        return CONFIG.unitLabels[data.unitCode];
    }
    if (data && data.unitLabel) return data.unitLabel;
    return 'Value';
}

function resolveTimelineEvents(timelineOptions) {
    timelineOptions = timelineOptions || {};
    var packs = (typeof CONFIG !== 'undefined' && CONFIG.eventOverlayPacks) ? CONFIG.eventOverlayPacks : null;
    if (!packs) {
        return (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.timelineEvents))
            ? CONFIG.timelineEvents.slice()
            : [];
    }

    var selectedPacks = Array.isArray(timelineOptions.packs) && timelineOptions.packs.length
        ? timelineOptions.packs
        : ['macro'];
    var majorOnly = !!timelineOptions.majorOnly;
    var countryCode = timelineOptions.countryCode || '';
    var events = [];

    for (var i = 0; i < selectedPacks.length; i++) {
        var pack = packs[selectedPacks[i]];
        if (!pack || !Array.isArray(pack.events)) continue;
        for (var j = 0; j < pack.events.length; j++) {
            var evt = pack.events[j];
            if (majorOnly && !evt.major) continue;
            if (evt.geo && evt.geo !== countryCode) continue;
            events.push(evt);
        }
    }

    return events;
}

function getTimelineAnnotations(years, timelineOptions) {
    if (!annotationPluginRegistered) return null;
    var events = resolveTimelineEvents(timelineOptions);
    if (!events.length) return null;
    var yearSet = {};
    for (var i = 0; i < years.length; i++) {
        yearSet[String(years[i])] = true;
    }
    var annotations = {};
    for (var j = 0; j < events.length; j++) {
        var evt = events[j];
        var eventYear = String(evt.year);
        if (!yearSet[eventYear]) continue;
        annotations['event' + j] = {
            type: 'line',
            xMin: eventYear,
            xMax: eventYear,
            borderColor: 'rgba(15, 23, 42, 0.35)',
            borderWidth: 1,
            label: {
                display: true,
                content: evt.label,
                position: 'start',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                font: { size: 9 },
                yAdjust: -10,
            },
        };
    }
    return Object.keys(annotations).length ? annotations : null;
}

function renderEurostatChart(data, element, chart, options) {
    if (!data || !Array.isArray(data.data) || !data.data.length) return chart;

    options = options || {};
    var chartType = options.chartType || 'line';
    var chartTitle = getChartTitle(data, options);
    var yAxisLabel = getYAxisLabel(data, options);
    registerAnnotationPlugin();

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
            title: { display: true, text: yAxisLabel },
            stacked: chartType === 'stacked-area',
        },
        x: {
            title: { display: true, text: 'Year' },
            stacked: chartType === 'stacked-area',
        },
    };

    var pluginOptions = {
        legend: { display: true },
        title: { display: true, text: chartTitle },
        tooltip: {
            callbacks: {
                label: function (context) {
                    var val = context.parsed.y;
                    if (val === null || val === undefined) return context.dataset.label + ': N/A';
                    return context.dataset.label + ': ' + val.toLocaleString();
                },
            },
        },
    };

    var annotations = getTimelineAnnotations(years, options.timelineOptions);
    if (annotations) {
        pluginOptions.annotation = { annotations: annotations };
    }

    return new Chart(ctx, {
        type: chartJsType,
        data: { labels: years, datasets: datasets },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: pluginOptions,
            scales: scaleOpts,
        },
    });
}
