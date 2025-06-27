// charts.js: Handles all Chart.js chart rendering

function renderGdpGrowthChart(data) {
    if (data && data.data && Array.isArray(data.data)) {
        // Add mainUnit label above the chart if available
        const unitLabel = document.getElementById('gdp-main-unit-label');
        if (unitLabel) {
            unitLabel.textContent = data.mainUnit ? `Main unit: ${data.mainUnit}` : '';
        }

        const ctx = document.getElementById('gdpGrowthChart').getContext('2d');
        const years = data.data.map(item => item.year);
        const gdpGrowth = data.data.map(item => item.gdp_growth);
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'GDP Growth (%)',
                    data: gdpGrowth,
                    borderColor: '#003399',
                    backgroundColor: 'rgba(0,51,153,0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: '#003399',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Greece GDP Growth by Year' }
                },
                scales: {
                    y: { beginAtZero: false, title: { display: true, text: 'GDP Growth (%)' } },
                    x: { title: { display: true, text: 'Year' } }
                }
            }
        });
    }
}

function renderTourismNightsChart(data) {
    if (data && Array.isArray(data.data)) {
        const ctx = document.getElementById('tourismNightsChart').getContext('2d');
        // Group data by geo (country)
        const countries = [...new Set(data.data.map(item => item.geo))];
        const years = [...new Set(data.data.map(item => item.time))].sort();
        // Prepare datasets for each country
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
        // Group data by geo (country)
        const countries = [...new Set(data.data.map(item => item.geo))];
        const years = [...new Set(data.data.map(item => item.time))].sort();
        // Prepare datasets for each country
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
        // Group data by geo (country)
        const countries = [...new Set(data.data.map(item => item.geo))];
        const years = [...new Set(data.data.map(item => item.time))].sort();
        // Prepare datasets for each country
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

function renderEurostatChart(data, element, chart) {
    if (data && Array.isArray(data.data)) {
        const ctx = document.getElementById(element).getContext('2d');
        // Destroy previous chart instance if it exists
        if (chart) {
            chart.destroy();
        }
        // Group data by geo (country)
        const countries = [...new Set(data.data.map(item => item.geo))];
        const years = [...new Set(data.data.map(item => item.time))].sort();
        // Prepare datasets for each country
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

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: data.label }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Value' } },
                    x: { title: { display: true, text: 'Year' } }
                }
            }
        });
    }
}
