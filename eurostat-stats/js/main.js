async function fetchEurostatData(eurostatUrl) {
    try {
        const response = await fetch(eurostatUrl, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const eurostatData = await response.json();
        const valueDict = eurostatData?.value || {};
        const dimension = eurostatData?.dimension || {};
        const size = eurostatData?.size || [];
        const label = eurostatData?.label || '';

        const getKeysFromIndex = (dim) => {
            if (!dim || !dim.category) return [];
            const idx = dim.category.index;
            if (Array.isArray(idx)) return idx.slice();
            if (idx && typeof idx === 'object') {
                return Object.entries(idx)
                    .sort((a, b) => a[1] - b[1])
                    .map(([k]) => k);
            }
            return [];
        };

        const geoDim = dimension.geo || {};
        const timeDim = dimension.time || {};
        const geoKeys = getKeysFromIndex(geoDim);
        const timeKeys = getKeysFromIndex(timeDim);
        const geoLabels = (geoDim.category && geoDim.category.label) ? geoDim.category.label : {};

        const results = [];
        for (const [key, val] of Object.entries(valueDict)) {
            const flatIndex = parseInt(key, 10);
            if (Number.isNaN(flatIndex)) continue;
            const time = timeKeys.length ? (flatIndex % timeKeys.length) : 0;
            const geo = timeKeys.length ? Math.floor(flatIndex / timeKeys.length) : 0;
            const entry = {
                geo: (geoLabels[geoKeys[geo]] ?? geoKeys[geo] ?? ''),
                time: timeKeys[time],
                value: String(val)
            };
            results.push(entry);
        }

        const updated = typeof eurostatData.updated === 'string' ? eurostatData.updated : '';
        const sizes = Array.isArray(size) ? size : [];

        const data = { updated, size: sizes, data: results, label };
        console.log('Eurostat data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching Eurostat data:', error);
    }
}
