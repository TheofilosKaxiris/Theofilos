const API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net';

async function fetchEurostatData(eurostatUrl) {
    try {
        const response = await fetch(`${API_URL}/home/eurostat-data?url=${encodeURIComponent(eurostatUrl)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': 'basicuser',
                'X-Password': 'z?4n$14gX_^gl69w'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Eurostat data:', data);

        return data;
    } catch (error) {
        console.error('Error fetching Eurostat data:', error);
    }
}

// Fetch waifus images from API
async function fetchWaifus(number) {
    try {
        const response = await fetch(`${API_URL}/home/waifu/generator?numberOfWaifus=${number}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': 'basicuser',
                'X-Password': 'z?4n$14gX_^gl69w'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Expecting an array of image URLs
        return data;
    } catch (error) {
        console.error('Error fetching waifus:', error);
        return [];
    }
}

// Fetch waifus images from url
async function fetchWaifus2(number) {
    try {
        const urls = [];
        for (let i = 0; i < number; i++) {
            const response = await fetch(`https://api.waifu.im/search`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const url = (await response.json()).images[0].url;
            urls.push(url);
        }
      
        // Expecting an array of image URLs
        return urls;
    } catch (error) {
        console.error('Error fetching waifus:', error);
        return [];
    }
}