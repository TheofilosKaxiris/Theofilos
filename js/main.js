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

// Fetch waifus images from url
async function* fetchWaifusGenerator(number) {
    try {
    
        for (let i = 0; i < number; i++) {
            const response = await fetch(`https://api.waifu.im/search`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            
            const url = (await response.json()).images[0].url;
            yield url;
            console.log(`Waifu ${i + 1}:`, url);
            if(i > 8){
                await delay(500);
            }
        }
    } catch (error) {
        console.error('Error fetching waifus:', error);
        return [];
    }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch Eurostat datasets from custom backend endpoint
async function fetchEurostatDatasets() {
    try {
        const response = await fetch(`${API_URL}/home/eurostat-datasets`, {
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
        console.log('Eurostat datasets:', data);
        return data;
    } catch (error) {
        console.error('Error fetching Eurostat datasets:', error);
        return [];
    }
}