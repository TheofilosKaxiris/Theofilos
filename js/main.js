// You can add your JavaScript code here for interactivity.
console.log('Eurostat Greece Statistics site loaded.');

// Example API endpoint (replace with your actual endpoint)
const API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/home/eurostat-data';

async function fetchEurostatData() {
    try {
        // Get the value from the input box (if it exists)
        var eurostatUrl = '';
        var urlInput = document.getElementById('eurostatUrlInput');
        if (urlInput) {
            eurostatUrl = encodeURIComponent(urlInput.value);
        }
        const response = await fetch(API_URL + `?url=${eurostatUrl}`, {
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
       
        renderGenericEurostatChart(data);
    } catch (error) {
        console.error('Error fetching Eurostat data:', error);
    }
}

// Fetch data on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchEurostatData();
});
