// stats.js — Streak tracking, statistics, and chart rendering

const Stats = (() => {

  function getDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function isActive(value, type) {
    if (value === null || value === undefined) return false;
    if (type === 'boolean') return !!value;
    return value > 0;
  }

  function calculateStats(track, entries) {
    const dates = Object.keys(entries).sort();
    const values = Object.values(entries);
    const activeDates = dates.filter(d => isActive(entries[d], track.type));

    // Current streak (from today backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(today);
    // Check if today is logged; if not, start from yesterday
    let todayStr = getDateStr(checkDate);
    if (!isActive(entries[todayStr], track.type)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const ds = getDateStr(checkDate);
      if (isActive(entries[ds], track.type)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    if (activeDates.length > 0) {
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < activeDates.length; i++) {
        const prev = new Date(activeDates[i - 1] + 'T00:00:00');
        const curr = new Date(activeDates[i] + 'T00:00:00');
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // Total active days
    const totalActiveDays = activeDates.length;

    // For numeric tracks
    let totalValue = 0;
    let dailyAverage = 0;
    let bestDay = null;
    let bestValue = 0;

    if (track.type === 'numeric') {
      totalValue = values.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      dailyAverage = totalActiveDays > 0 ? totalValue / totalActiveDays : 0;
      for (const [date, value] of Object.entries(entries)) {
        if (typeof value === 'number' && value > bestValue) {
          bestValue = value;
          bestDay = date;
        }
      }
    }

    // Most active day of week
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const date of activeDates) {
      const d = new Date(date + 'T00:00:00');
      dayOfWeekCounts[d.getDay()]++;
    }
    const maxDayCount = Math.max(...dayOfWeekCounts);
    const mostActiveDay = maxDayCount > 0 ? dayNames[dayOfWeekCounts.indexOf(maxDayCount)] : null;

    // Monthly breakdown (last 12 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { total: 0, count: 0 };
    }
    for (const [date, value] of Object.entries(entries)) {
      const monthKey = date.substring(0, 7);
      if (monthlyData[monthKey] && isActive(value, track.type)) {
        monthlyData[monthKey].total += (track.type === 'numeric' ? value : 1);
        monthlyData[monthKey].count++;
      }
    }

    return {
      currentStreak,
      longestStreak,
      totalActiveDays,
      totalValue: Math.round(totalValue * 100) / 100,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      bestDay,
      bestValue,
      mostActiveDay,
      monthlyData,
    };
  }

  function renderStatCards(container, track, stats) {
    container.innerHTML = '';

    const cards = [
      { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: '🔥' },
      { label: 'Longest Streak', value: `${stats.longestStreak} days`, icon: '🏆' },
      { label: 'Total Active Days', value: stats.totalActiveDays, icon: '📅' },
    ];

    if (track.type === 'numeric') {
      cards.push({ label: `Total ${track.unit || 'Value'}`, value: stats.totalValue.toLocaleString(), icon: '📊' });
      cards.push({ label: 'Daily Average', value: `${stats.dailyAverage} ${track.unit || ''}`.trim(), icon: '📈' });
      if (stats.bestDay) {
        const bd = new Date(stats.bestDay + 'T00:00:00');
        const formatted = bd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        cards.push({ label: 'Best Day', value: `${stats.bestValue} ${track.unit || ''} (${formatted})`.trim(), icon: '⭐' });
      }
    }

    if (stats.mostActiveDay) {
      cards.push({ label: 'Most Active Day', value: stats.mostActiveDay, icon: '📆' });
    }

    for (const card of cards) {
      const el = document.createElement('div');
      el.className = 'stat-card';
      el.innerHTML = `
        <div class="stat-icon">${card.icon}</div>
        <div class="stat-value">${card.value}</div>
        <div class="stat-label">${card.label}</div>
      `;
      container.appendChild(el);
    }
  }

  function renderMonthlyChart(container, track, stats) {
    container.innerHTML = '';
    const data = stats.monthlyData;
    const months = Object.keys(data);
    const values = months.map(m => data[m].total);
    const maxVal = Math.max(...values, 1);

    const chartHTML = document.createElement('div');
    chartHTML.className = 'monthly-chart';

    const title = document.createElement('h3');
    title.textContent = 'Monthly Breakdown';
    title.className = 'chart-title';
    chartHTML.appendChild(title);

    const barsContainer = document.createElement('div');
    barsContainer.className = 'chart-bars';

    const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < months.length; i++) {
      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';

      const barValue = document.createElement('div');
      barValue.className = 'chart-bar-value';
      barValue.textContent = values[i] || '';

      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      const heightPct = maxVal > 0 ? (values[i] / maxVal) * 100 : 0;
      bar.style.height = Math.max(heightPct, 2) + '%';

      const colorScheme = track.colorScheme || 'green';
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const schemes = isDark ? Heatmap.COLOR_SCHEMES : Heatmap.COLOR_SCHEMES_LIGHT;
      bar.style.backgroundColor = (schemes[colorScheme] || schemes.green)[3];

      const label = document.createElement('div');
      label.className = 'chart-bar-label';
      const monthIdx = parseInt(months[i].split('-')[1]) - 1;
      label.textContent = monthShort[monthIdx];

      barWrapper.appendChild(barValue);
      barWrapper.appendChild(bar);
      barWrapper.appendChild(label);
      barsContainer.appendChild(barWrapper);
    }

    chartHTML.appendChild(barsContainer);
    container.appendChild(chartHTML);
  }

  // Compare two tracks
  function renderComparisonChart(container, track1, entries1, stats1, track2, entries2, stats2) {
    container.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = `${track1.name} vs ${track2.name}`;
    title.className = 'chart-title';
    container.appendChild(title);

    const months1 = Object.keys(stats1.monthlyData);
    const barsContainer = document.createElement('div');
    barsContainer.className = 'chart-bars comparison-chart';

    const vals1 = months1.map(m => stats1.monthlyData[m].total);
    const vals2 = months1.map(m => (stats2.monthlyData[m] ? stats2.monthlyData[m].total : 0));
    const maxVal = Math.max(...vals1, ...vals2, 1);

    const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const schemes = isDark ? Heatmap.COLOR_SCHEMES : Heatmap.COLOR_SCHEMES_LIGHT;

    for (let i = 0; i < months1.length; i++) {
      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper dual';

      const barGroup = document.createElement('div');
      barGroup.className = 'chart-bar-group';

      const bar1 = document.createElement('div');
      bar1.className = 'chart-bar';
      bar1.style.height = Math.max((vals1[i] / maxVal) * 100, 2) + '%';
      bar1.style.backgroundColor = (schemes[track1.colorScheme] || schemes.green)[3];

      const bar2 = document.createElement('div');
      bar2.className = 'chart-bar';
      bar2.style.height = Math.max((vals2[i] / maxVal) * 100, 2) + '%';
      bar2.style.backgroundColor = (schemes[track2.colorScheme] || schemes.green)[3];

      barGroup.appendChild(bar1);
      barGroup.appendChild(bar2);

      const label = document.createElement('div');
      label.className = 'chart-bar-label';
      const monthIdx = parseInt(months1[i].split('-')[1]) - 1;
      label.textContent = monthShort[monthIdx];

      barWrapper.appendChild(barGroup);
      barWrapper.appendChild(label);
      barsContainer.appendChild(barWrapper);
    }

    container.appendChild(barsContainer);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.innerHTML = `
      <span class="legend-item"><span class="legend-dot" style="background:${(schemes[track1.colorScheme] || schemes.green)[3]}"></span>${track1.name}</span>
      <span class="legend-item"><span class="legend-dot" style="background:${(schemes[track2.colorScheme] || schemes.green)[3]}"></span>${track2.name}</span>
    `;
    container.appendChild(legend);
  }

  return { calculateStats, renderStatCards, renderMonthlyChart, renderComparisonChart };
})();
