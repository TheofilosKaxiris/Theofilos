// Fetch waifus images from url
async function* fetchWaifusGenerator(number) {
    const pageSize = 30; // max per request to stay safe
    let fetched = 0;

    try {
        while (fetched < number) {
            const batchSize = Math.min(pageSize, number - fetched);
            const response = await fetchWithRetry(
                `https://api.waifu.im/images?PageSize=${batchSize}`
            );
            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            for (const item of data.items) {
                yield item.url;
                fetched++;
                console.log(`Waifu ${fetched}:`, item.url);
            }

            // If API returned fewer items than requested, stop
            if (data.items.length < batchSize) break;
        }
    } catch (error) {
        console.error('Error fetching waifus:', error);
    }
}

// Fetch with retry on 429 rate-limit responses
async function fetchWithRetry(url, maxRetries = 5) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept-Version': 'v7' },
        });
        if (response.status !== 429) return response;

        const retryAfter = response.headers.get('Retry-After') ?? 2 ** attempt;
        console.warn(`Rate limited, retrying in ${retryAfter}s...`);
        await delay(Number(retryAfter) * 1000);
    }
    throw new Error('Max retries exceeded (429)');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}