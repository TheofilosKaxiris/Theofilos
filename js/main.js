// You can add your JavaScript code here for interactivity.
console.log('Eurostat Greece Statistics site loaded.');

// Example API endpoint (replace with your actual endpoint)
const API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/home/statistics';

async function fetchEurostatData() {
    try {
        const response = await fetch(API_URL, {
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
        // Show the data in the economy section under the existing div
        const economyDiv = document.getElementById('economy-api-data');
        if (economyDiv) {
            economyDiv.textContent = `API Data: ${JSON.stringify(data)}`;
        }
    } catch (error) {
        console.error('Error fetching Eurostat data:', error);
    }
}

// Fetch data on page load
window.addEventListener('DOMContentLoaded', fetchEurostatData);
