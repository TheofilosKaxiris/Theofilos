// Eurostat Stats — Data Fetching
// Fetches and normalizes Eurostat API responses with caching support.

async function fetchEurostatData(eurostatUrl, options) {
    options = options || {};
    var skipCache = options.skipCache || false;

    // Check cache first
    if (!skipCache && typeof EurostatCache !== 'undefined') {
        var cached = EurostatCache.get(eurostatUrl);
        if (cached) {
            cached._fromCache = true;
            return cached;
        }
    }

    try {
        var response = await fetch(eurostatUrl, { method: 'GET' });

        if (!response.ok) {
            var status = response.status;
            if (status === 404) throw new Error('Dataset not found. Check the dataset code in your URL.');
            if (status === 400) throw new Error('Bad request. Check your URL parameters (filters, country codes).');
            if (status === 429) throw new Error('Too many requests. The Eurostat API is rate-limited — please wait a moment.');
            throw new Error('Eurostat API returned HTTP ' + status);
        }

        var eurostatData = await response.json();
        var valueDict = eurostatData && eurostatData.value || {};
        var dimension = eurostatData && eurostatData.dimension || {};
        var size = eurostatData && eurostatData.size || [];
        var label = eurostatData && eurostatData.label || '';

        var getKeysFromIndex = function (dim) {
            if (!dim || !dim.category) return [];
            var idx = dim.category.index;
            if (Array.isArray(idx)) return idx.slice();
            if (idx && typeof idx === 'object') {
                return Object.entries(idx)
                    .sort(function (a, b) { return a[1] - b[1]; })
                    .map(function (e) { return e[0]; });
            }
            return [];
        };

        var geoDim = dimension.geo || {};
        var timeDim = dimension.time || {};
        var geoKeys = getKeysFromIndex(geoDim);
        var timeKeys = getKeysFromIndex(timeDim);
        var geoLabels = (geoDim.category && geoDim.category.label) ? geoDim.category.label : {};

        var results = [];
        for (var key in valueDict) {
            if (!valueDict.hasOwnProperty(key)) continue;
            var val = valueDict[key];
            var flatIndex = parseInt(key, 10);
            if (Number.isNaN(flatIndex)) continue;
            var timeIdx = timeKeys.length ? (flatIndex % timeKeys.length) : 0;
            var geoIdx = timeKeys.length ? Math.floor(flatIndex / timeKeys.length) : 0;
            results.push({
                geo: geoLabels[geoKeys[geoIdx]] || geoKeys[geoIdx] || '',
                geoCode: geoKeys[geoIdx] || '',
                time: timeKeys[timeIdx],
                value: String(val),
            });
        }

        var updated = typeof eurostatData.updated === 'string' ? eurostatData.updated : '';
        var sizes = Array.isArray(size) ? size : [];

        var data = { updated: updated, size: sizes, data: results, label: label, _fromCache: false };

        // Store in cache
        if (typeof EurostatCache !== 'undefined') {
            EurostatCache.set(eurostatUrl, data);
        }

        return data;

    } catch (error) {
        console.error('Error fetching Eurostat data:', error);
        // Show user-visible error if UI is available
        if (typeof UI !== 'undefined') {
            UI.toast(error.message || 'Failed to fetch data from Eurostat.', 'error');
        }
        return null;
    }
}
