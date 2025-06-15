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
