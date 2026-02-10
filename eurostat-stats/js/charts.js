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
