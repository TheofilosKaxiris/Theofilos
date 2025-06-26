// tourism-charts.js: Handles all Chart.js tourism chart rendering

function renderTourismNightsChart(data) {
    if (data && Array.isArray(data.data)) {
        const ctx = document.getElementById('tourismNightsChart').getContext('2d');
        const countries = [...new Set(data.data.map(item => item.geo))];
        const years = [...new Set(data.data.map(item => item.time))].sort();
        const datasets = countries.map((country, idx) => {
            const color = `hsl(${(idx * 60) % 360}, 70%, 45%)`;
            return {
                label: country,
                data: years.map(year => {
                    const entry = data.data.find(d => d.geo === country && d.time === year);
                    return entry ? Number(entry.value) : null;
                }),
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3,
                pointRadius: 2,
            };
        });
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Tourism: Nights Spent Comparison' }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Nights Spent' } },
                    x: { title: { display: true, text: 'Year' } }
                }
            }
        });
    }
}

function renderEstablishmentsCompareChart(data) {
    if (data && Array.isArray(data.data)) {
        const ctx = document.getElementById('establishmentsCompareChart').getContext('2d');
        const countries = [...new Set(data.data.map(item => item.geo))];
        const years = [...new Set(data.data.map(item => item.time))].sort();
        const datasets = countries.map((country, idx) => {
            const color = `hsl(${(idx * 60) % 360}, 70%, 45%)`;
            return {
                label: country,
                data: years.map(year => {
                    const entry = data.data.find(d => d.geo === country && d.time === year);
                    return entry ? Number(entry.value) : null;
                }),
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3,
                pointRadius: 2,
            };
        });
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Tourism: Establishments Comparison' }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Establishments' } },
                    x: { title: { display: true, text: 'Year' } }
                }
            }
        });
    }
}

function renderOccupancyRateCompareChart(data) {
    if (data && Array.isArray(data.data)) {
        const ctx = document.getElementById('occupancyRateCompareChart').getContext('2d');
        const countries = [...new Set(data.data.map(item => item.geo))];
        const years = [...new Set(data.data.map(item => item.time))].sort();
        const datasets = countries.map((country, idx) => {
            const color = `hsl(${(idx * 60) % 360}, 70%, 45%)`;
            return {
                label: country,
                data: years.map(year => {
                    const entry = data.data.find(d => d.geo === country && d.time === year);
                    return entry ? Number(entry.value) : null;
                }),
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3,
                pointRadius: 2,
            };
        });
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Tourism: Occupancy Rate Comparison' }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Occupancy Rate' } },
                    x: { title: { display: true, text: 'Year' } }
                }
            }
        });
    }
}

// Move tourism fetch and DOMContentLoaded logic here from main.js

const TOURISM_API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/tourism/nights-spent-compare';
const ESTABLISHMENTS_API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/tourism/establishments-compare';
const OCCUPANCY_RATE_API_URL = 'https://eurostat-akis-a0dgcbhcemhzdghq.westeurope-01.azurewebsites.net/tourism/occupancy-rate-compare';

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

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tourismNightsChart')) fetchTourismNightsData();
    if (document.getElementById('establishmentsCompareChart')) fetchEstablishmentsCompareData();
    if (document.getElementById('occupancyRateCompareChart')) fetchOccupancyRateCompareData();
});
