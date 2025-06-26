// You can add your JavaScript code here for interactivity.
console.log('Eurostat Greece Statistics site loaded.');

// Example API endpoint (replace with your actual endpoint)
const API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/home/gdp-growth';
const TOURISM_API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/tourism/nights-spent-compare';
const ESTABLISHMENTS_API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/tourism/establishments-compare';
const OCCUPANCY_RATE_API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/tourism/occupancy-rate-compare';

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

async function fetchEstablishmentsCompareData() {
    try {
        const response = await fetch(ESTABLISHMENTS_API_URL, {
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
        console.log('Establishments compare data:', data);
        renderEstablishmentsCompareChart(data);
    } catch (error) {
        console.error('Error fetching establishments compare data:', error);
    }
}

async function fetchOccupancyRateCompareData() {
    try {
        const response = await fetch(OCCUPANCY_RATE_API_URL, {
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
        console.log('Occupancy rate compare data:', data);
        renderOccupancyRateCompareChart(data);
    } catch (error) {
        console.error('Error fetching occupancy rate compare data:', error);
    }
}

// Fetch data on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchEurostatData();
    fetchTourismNightsData();
    fetchEstablishmentsCompareData();
    fetchOccupancyRateCompareData();
});
