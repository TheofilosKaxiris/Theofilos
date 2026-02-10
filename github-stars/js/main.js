// Fetch most-starred repositories from GitHub with paging (up to 1000 per query).
// Uses the GitHub Search API: https://docs.github.com/en/rest/search/search#search-repositories
// Notes:
//  - Rate limits (unauthenticated): ~10 search requests / minute. Authenticated: higher.
//  - Provide a personal access token for reliability under heavier usage.
//  - This file exposes only the paged function: getMostStarredReposPaged.
//
// Example usage in browser console:
//    getMostStarredRepos().then(list => console.log(list));
//    getMostStarredRepos({ limit: 10 }).then(console.log);
//    getMostStarredRepos({ token: 'ghp_XXXX', limit: 25 }).then(console.log);

(function() {

	// ---------- Helpers ----------
	function _simplifyRepo(repo) {
		return {
			id: repo.id,
			name: repo.name,
			full_name: repo.full_name,
			description: repo.description,
			html_url: repo.html_url,
			stargazers_count: repo.stargazers_count,
			language: repo.language,
			forks_count: repo.forks_count,
			open_issues_count: repo.open_issues_count,
			watchers_count: repo.watchers_count,
			license: repo.license ? repo.license.spdx_id : null,
			topics: repo.topics || [],
			owner: {
				login: repo.owner && repo.owner.login,
				avatar_url: repo.owner && repo.owner.avatar_url,
				html_url: repo.owner && repo.owner.html_url
			},
			fetched_at: new Date().toISOString()
		};
	}

	function _sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

	async function _fetchSearchPage({ q, sort = 'stars', order = 'desc', perPage = 100, page = 1, token, signal }) {
		const endpoint =
			`https://api.github.com/search/repositories` +
			`?q=${encodeURIComponent(q)}` +
			`&sort=${encodeURIComponent(sort)}` +
			`&order=${encodeURIComponent(order)}` +
			`&per_page=${Math.min(100, Math.max(1, perPage))}` +
			`&page=${page}`;

		const headers = { 'Accept': 'application/vnd.github+json' };
		if (token) headers['Authorization'] = `Bearer ${token}`;

		let response;
		try {
			response = await fetch(endpoint, { headers, signal });
		} catch (e) {
			throw new Error('Network error while contacting GitHub: ' + e.message);
		}

		// Basic rate-limit wait-and-retry
		if (response.status === 403) {
			const reset = response.headers.get('x-ratelimit-reset');
			if (reset) {
				const waitMs = Math.max(0, (Number(reset) * 1000) - Date.now()) + 1000;
				await _sleep(waitMs);
				return _fetchSearchPage({ q, sort, order, perPage, page, token, signal });
			}
		}

		if (!response.ok) {
			let detail = '';
			try {
				const errJson = await response.json();
				if (errJson && errJson.message) detail = ' - ' + errJson.message;
			} catch {}
			throw new Error(`GitHub API error (${response.status})${detail}`);
		}

		const data = await response.json();
		return data;
	}

	/**
	 * Paginate within a single query (capped to 1000 results by GitHub Search API).
	 * @param {Object} options
	 * @param {number} [options.total=1000]
	 * @param {number} [options.perPage=100]
	 * @param {string} [options.q='stars:>1']
	 * @param {string} [options.token]
	 * @param {AbortSignal} [options.signal]
	 * @param {(info:{page:number,received:number,totalReceived:number,target:number})=>void} [options.onPage]
	 */
	async function getMostStarredReposPaged(options = {}) {
		let {
			total = 1000,
			perPage = 100,
			q = 'stars:>1',
			token,
			signal,
			onPage
		} = options;

		perPage = Math.min(100, Math.max(1, Math.floor(perPage)));
		total = Math.max(1, Math.floor(total));
		const target = Math.min(total, 1000);

		const results = [];
		let page = 1;
		while (results.length < target) {
			const remaining = target - results.length;
			const per = Math.min(perPage, remaining);
			const data = await _fetchSearchPage({ q, perPage: per, page, token, signal });
			const items = Array.isArray(data.items) ? data.items.map(_simplifyRepo) : [];
			results.push(...items);

			if (typeof onPage === 'function') {
				try { onPage({ page, received: items.length, totalReceived: results.length, target }); } catch {}
			}

			if (items.length < per) break;
			page += 1;
		}

		return results;
	}

	// ---- Star-banded helpers ----
	async function _probeTopStars({ token, signal, baseQuery = '' } = {}) {
		const q = `${baseQuery}stars:>1`.trim();
		const data = await _fetchSearchPage({ q, sort: 'stars', order: 'desc', perPage: 1, page: 1, token, signal });
		const top = Array.isArray(data.items) && data.items[0];
		return top ? (top.stargazers_count || 0) : 0;
	}

	async function _countForRange({ min, max, token, signal, baseQuery = '' }) {
		const q = `${baseQuery}stars:${min}..${max}`.trim();
		const data = await _fetchSearchPage({ q, sort: 'stars', order: 'desc', perPage: 1, page: 1, token, signal });
		const count = Math.max(0, Math.min(1e9, Number(data.total_count) || 0));
		const top = Array.isArray(data.items) && data.items[0];
		const topStars = top ? (top.stargazers_count || 0) : 0;
		return { count, topStars };
	}

	/**
	 * Star-banded segmentation: fetch true top-N by splitting on stars ranges (each band <= 1000).
	 * @param {Object} options
	 * @param {number} [options.total=2000]
	 * @param {number} [options.perPage=100]
	 * @param {string} [options.token]
	 * @param {AbortSignal} [options.signal]
	 * @param {(info:{window:{stars:[number,number]},page:number,received:number,totalReceived:number,target:number})=>void} [options.onPage]
	 * @param {string} [options.baseQuery] - Optional prefix for the query, e.g., 'language:JavaScript '
	 */
	async function getMostStarredReposSegmented(options = {}) {
		let {
			total = 2000,
			perPage = 100,
			token,
			signal,
			onPage,
			baseQuery = ''
		} = options;

		perPage = Math.min(100, Math.max(1, Math.floor(perPage)));
		total = Math.max(1, Math.floor(total));

		const prefix = baseQuery ? (baseQuery.trim() + ' ') : '';
		const sMax = await _probeTopStars({ token, signal, baseQuery: prefix });
		if (!sMax) return [];

		// Build bands by splitting [1..sMax] until each band has <= 1000 results
		const stack = [{ min: 1, max: sMax }];
		const bands = [];
		let planned = 0;
		while (stack.length && planned < total) {
			const r = stack.pop();
			if (!r || r.min > r.max) continue;
			const { count } = await _countForRange({ min: r.min, max: r.max, token, signal, baseQuery: prefix });
			if (count === 0) continue;
			if (count > 1000 && r.min < r.max) {
				const mid = Math.floor((r.min + r.max) / 2);
				// Push lower then higher so higher is processed last; we'll sort later anyway
				stack.push({ min: r.min, max: mid });
				stack.push({ min: mid + 1, max: r.max });
				continue;
			}
			bands.push({ ...r, count });
			planned += count;
		}

		// Highest-star bands first
		bands.sort((a, b) => b.max - a.max);

		// Fetch band-by-band
		const map = new Map();
		for (const band of bands) {
			if (map.size >= total) break;
			const q = `${prefix}stars:${band.min}..${band.max}`.trim();
			let page = 1;
			const maxPages = Math.ceil(Math.min(1000, band.count) / perPage);
			while (page <= maxPages && map.size < total) {
				const data = await _fetchSearchPage({ q, sort: 'stars', order: 'desc', perPage, page, token, signal });
				const items = Array.isArray(data.items) ? data.items.map(_simplifyRepo) : [];
				for (const it of items) {
					if (!map.has(it.id)) map.set(it.id, it);
					if (map.size >= total) break;
				}
				if (typeof onPage === 'function') {
					try { onPage({ window: { stars: [band.min, band.max] }, page, received: items.length, totalReceived: map.size, target: total }); } catch {}
				}
				if (items.length < perPage) break;
				page += 1;
			}
		}

		return Array.from(map.values())
			.sort((a, b) => (b.stargazers_count - a.stargazers_count) || (b.forks_count - a.forks_count) || a.full_name.localeCompare(b.full_name))
			.slice(0, total);
	}

	// Expose globally for now; in a module bundler you would export.
	window.getMostStarredReposPaged = getMostStarredReposPaged;
	window.getMostStarredReposSegmented = getMostStarredReposSegmented;
})();

