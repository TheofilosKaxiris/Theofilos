// You can add your JavaScript code here for interactivity.
console.log('Eurostat Greece Statistics site loaded.');

// Example API endpoint (replace with your actual endpoint)
const API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/home/gdp-growth';
const TOURISM_API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/tourism/nights-spent-compare';

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
       
        // Chart.js: Show GDP growth chart
        renderGdpGrowthChart(data);
    } catch (error) {
        console.error('Error fetching Eurostat data:', error);
    }
}

async function fetchTourismNightsData() {
    try {
        const response = await fetch(TOURISM_API_URL, {
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
        console.log('Tourism nights data:', data);
        renderTourismNightsChart(data);
    } catch (error) {
        console.error('Error fetching tourism nights data:', error);
    }
}

// Fetch data on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchEurostatData();
    fetchTourismNightsData();
});
