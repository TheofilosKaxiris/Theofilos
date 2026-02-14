// Eurostat Stats — localStorage Cache with TTL
// Caches API responses to reduce redundant network requests.

const EurostatCache = {
    _prefix: (typeof CONFIG !== 'undefined' && CONFIG.cache && CONFIG.cache.prefix)
        ? CONFIG.cache.prefix : 'eurostat_cache_',

    _ttl: (typeof CONFIG !== 'undefined' && CONFIG.cache && CONFIG.cache.ttlMs)
        ? CONFIG.cache.ttlMs : 24 * 60 * 60 * 1000,

    _key(url) {
        return this._prefix + url;
    },

    get(url) {
        try {
            const raw = localStorage.getItem(this._key(url));
            if (!raw) return null;
            const entry = JSON.parse(raw);
            if (Date.now() - entry.ts > this._ttl) {
                localStorage.removeItem(this._key(url));
                return null;
            }
            return entry.data;
        } catch {
            return null;
        }
    },

    set(url, data) {
        try {
            const entry = { ts: Date.now(), data };
            localStorage.setItem(this._key(url), JSON.stringify(entry));
        } catch {
            // localStorage full — evict oldest entries and retry
            this._evictOldest();
            try {
                localStorage.setItem(this._key(url), JSON.stringify({ ts: Date.now(), data }));
            } catch {
                // still full — silently give up
            }
        }
    },

    remove(url) {
        localStorage.removeItem(this._key(url));
    },

    clear() {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(this._prefix)) toRemove.push(k);
        }
        toRemove.forEach(k => localStorage.removeItem(k));
    },

    _evictOldest() {
        let oldest = null;
        let oldestKey = null;
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith(this._prefix)) continue;
            try {
                const entry = JSON.parse(localStorage.getItem(k));
                if (!oldest || entry.ts < oldest) {
                    oldest = entry.ts;
                    oldestKey = k;
                }
            } catch { /* skip corrupt entries */ }
        }
        if (oldestKey) localStorage.removeItem(oldestKey);
    },

    stats() {
        let count = 0;
        let bytes = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(this._prefix)) {
                count++;
                bytes += (localStorage.getItem(k) || '').length * 2; // rough UTF-16 estimate
            }
        }
        return { count, bytesEstimate: bytes };
    },
};
