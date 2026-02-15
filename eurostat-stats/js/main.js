// Eurostat Stats — Data Fetching
// Fetches and normalizes Eurostat API responses with caching support.

async function fetchEurostatData(eurostatUrl, options) {
    options = options || {};
    var skipCache = options.skipCache || false;
    var datasetCodeMatch = (typeof eurostatUrl === 'string')
        ? eurostatUrl.match(/\/data\/([^/?#]+)/i)
        : null;
    var datasetCode = datasetCodeMatch ? decodeURIComponent(datasetCodeMatch[1]) : '';
    var preferredLabel = (typeof DATASETS !== 'undefined' && DATASETS[datasetCode] && DATASETS[datasetCode].name)
        ? DATASETS[datasetCode].name
        : '';

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
        var dimensionOrder = Array.isArray(eurostatData && eurostatData.id) ? eurostatData.id.slice() : [];
        if (!dimensionOrder.length && Array.isArray(dimension.id)) {
            dimensionOrder = dimension.id.slice();
        }
        if (!dimensionOrder.length) {
            dimensionOrder = Object.keys(dimension).filter(function (k) { return k !== 'id'; });
        }

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

        var dimSizes = Array.isArray(size) ? size.slice() : [];
        if (dimSizes.length !== dimensionOrder.length) {
            dimSizes = dimensionOrder.map(function (dimName, idx) {
                if (typeof size[idx] === 'number') return size[idx];
                var keys = getKeysFromIndex(dimension[dimName]);
                return keys.length || 1;
            });
        }

        var strides = new Array(dimSizes.length);
        var stride = 1;
        for (var i = dimSizes.length - 1; i >= 0; i--) {
            strides[i] = stride;
            stride *= (dimSizes[i] || 1);
        }

        var getDimIndex = function (flatIndex, dimPos) {
            if (dimPos < 0 || dimPos >= dimSizes.length) return 0;
            var dimSize = dimSizes[dimPos] || 1;
            return Math.floor(flatIndex / strides[dimPos]) % dimSize;
        };

        var geoDim = dimension.geo || {};
        var timeDim = dimension.time || {};
        var unitDim = dimension.unit || {};
        var geoKeys = getKeysFromIndex(geoDim);
        var timeKeys = getKeysFromIndex(timeDim);
        var unitKeys = getKeysFromIndex(unitDim);
        var geoLabels = (geoDim.category && geoDim.category.label) ? geoDim.category.label : {};
        var unitLabelMap = (unitDim.category && unitDim.category.label) ? unitDim.category.label : {};
        var geoPos = dimensionOrder.indexOf('geo');
        var timePos = dimensionOrder.indexOf('time');
        var unitPos = dimensionOrder.indexOf('unit');

        var inferredUnitCode = '';
        var inferredUnitLabel = '';
        var mixedUnits = false;
        var registerUnitCode = function (code) {
            if (!code) return;
            if (!inferredUnitCode) {
                inferredUnitCode = code;
                inferredUnitLabel = unitLabelMap[code] || '';
                return;
            }
            if (inferredUnitCode !== code) {
                mixedUnits = true;
            }
        };
        if (unitKeys.length === 1) {
            registerUnitCode(unitKeys[0]);
        }

        var results = [];
        for (var key in valueDict) {
            if (!valueDict.hasOwnProperty(key)) continue;
            var val = valueDict[key];
            var flatIndex = parseInt(key, 10);
            if (Number.isNaN(flatIndex)) continue;
            var geoIdx = getDimIndex(flatIndex, geoPos);
            var timeIdx = getDimIndex(flatIndex, timePos);
            if (unitPos !== -1 && unitKeys.length > 1) {
                registerUnitCode(unitKeys[getDimIndex(flatIndex, unitPos)] || '');
            }
            results.push({
                geo: geoLabels[geoKeys[geoIdx]] || geoKeys[geoIdx] || '',
                geoCode: geoKeys[geoIdx] || '',
                time: timeKeys[timeIdx],
                value: String(val),
            });
        }
        if (mixedUnits) {
            inferredUnitCode = '';
            inferredUnitLabel = 'Mixed units';
        }

        var updated = typeof eurostatData.updated === 'string' ? eurostatData.updated : '';

        var data = {
            updated: updated,
            size: dimSizes,
            data: results,
            label: label,
            preferredLabel: preferredLabel || label,
            datasetCode: datasetCode,
            unitCode: inferredUnitCode,
            unitLabel: inferredUnitLabel,
            _fromCache: false,
        };

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
