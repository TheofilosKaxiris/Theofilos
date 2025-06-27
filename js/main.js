const API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/home/eurostat-data';

async function fetchEurostatData(eurostatUrl) {
    try {
        const response = await fetch(API_URL + `?url=${encodeURIComponent(eurostatUrl)}`, {
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