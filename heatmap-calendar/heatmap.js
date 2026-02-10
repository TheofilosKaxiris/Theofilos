// heatmap.js — SVG heatmap renderer

const Heatmap = (() => {
  const CELL_SIZE = 11;
  const CELL_GAP = 2;
  const CELL_STEP = CELL_SIZE + CELL_GAP;
  const LABEL_WIDTH = 30;
  const MONTH_LABEL_HEIGHT = 18;
  const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  const COLOR_SCHEMES = {
    green:  ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    blue:   ['#161b22', '#0a3069', '#0550ae', '#218bff', '#58a6ff'],
    purple: ['#161b22', '#3b1f5e', '#6e40c9', '#8957e5', '#b87afc'],
    orange: ['#161b22', '#5c2d00', '#9e4a00', '#d18616', '#f0b840'],
    red:    ['#161b22', '#5c0d12', '#9e1c23', '#da3633', '#f85149'],
  };

  const COLOR_SCHEMES_LIGHT = {
    green:  ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    blue:   ['#ebedf0', '#b6d7ff', '#79b8ff', '#2188ff', '#0366d6'],
    purple: ['#ebedf0', '#d8b9ff', '#b87afc', '#8957e5', '#6f42c1'],
    orange: ['#ebedf0', '#ffdfb0', '#f0b840', '#d18616', '#9e4a00'],
    red:    ['#ebedf0', '#ffc1c0', '#f85149', '#da3633', '#9e1c23'],
  };

  function getDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function getColorLevel(value, track) {
    if (value === null || value === undefined) return 0;
    if (track.type === 'boolean') return value ? 4 : 0;
    if (value <= 0) return 0;
    const goal = track.goal || value; // if no goal, any value is max
    const pct = value / goal;
    if (pct <= 0.25) return 1;
    if (pct <= 0.50) return 2;
    if (pct <= 0.75) return 3;
    return 4;
  }

  function getColors(scheme, isDark) {
    const map = isDark ? COLOR_SCHEMES : COLOR_SCHEMES_LIGHT;
    return map[scheme] || map.green;
  }

  function buildDayGrid(rangeMode, customYear) {
    // Generate the array of dates for the heatmap
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate, endDate;

    if (rangeMode === 'year' && customYear) {
      startDate = new Date(customYear, 0, 1);
      endDate = new Date(customYear, 11, 31);
    } else if (rangeMode === '6months') {
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 6);
    } else {
      // last 365 days (default)
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 364);
    }

    // Adjust startDate to previous Monday
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    // Pad to fill the last week
    while (days.length % 7 !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { days, startDate, endDate: days[days.length - 1] };
  }

  function render(container, track, entries, options = {}) {
    const isDark = options.isDark !== false;
    const rangeMode = options.rangeMode || 'rolling';
    const customYear = options.customYear || null;
    const onCellClick = options.onCellClick || null;
    const compact = options.compact || false;

    const { days } = buildDayGrid(rangeMode, customYear);
    const totalWeeks = Math.ceil(days.length / 7);
    const colors = getColors(track.colorScheme, isDark);

    const svgWidth = LABEL_WIDTH + totalWeeks * CELL_STEP + 4;
    const svgHeight = MONTH_LABEL_HEIGHT + 7 * CELL_STEP + 4;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);
    svg.setAttribute('class', 'heatmap-svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    // Day-of-week labels
    if (!compact) {
      DAY_LABELS.forEach((label, i) => {
        if (!label) return;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', LABEL_WIDTH - 6);
        text.setAttribute('y', MONTH_LABEL_HEIGHT + i * CELL_STEP + CELL_SIZE - 1);
        text.setAttribute('class', 'heatmap-day-label');
        text.setAttribute('text-anchor', 'end');
        text.textContent = label;
        svg.appendChild(text);
      });
    }

    // Month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;
    for (let week = 0; week < totalWeeks; week++) {
      const dayIdx = week * 7;
      if (dayIdx >= days.length) break;
      const d = days[dayIdx];
      const month = d.getMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', LABEL_WIDTH + week * CELL_STEP);
        text.setAttribute('y', MONTH_LABEL_HEIGHT - 4);
        text.setAttribute('class', 'heatmap-month-label');
        text.textContent = monthNames[month];
        svg.appendChild(text);
      }
    }

    // Cells
    const tooltip = document.createElement('div');
    tooltip.className = 'heatmap-tooltip';
    tooltip.style.display = 'none';

    for (let i = 0; i < days.length; i++) {
      const week = Math.floor(i / 7);
      const dayOfWeek = i % 7;
      const date = days[i];
      const dateStr = getDateStr(date);
      const value = entries[dateStr] !== undefined ? entries[dateStr] : null;
      const level = getColorLevel(value, track);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', LABEL_WIDTH + week * CELL_STEP);
      rect.setAttribute('y', MONTH_LABEL_HEIGHT + dayOfWeek * CELL_STEP);
      rect.setAttribute('width', CELL_SIZE);
      rect.setAttribute('height', CELL_SIZE);
      rect.setAttribute('rx', 2);
      rect.setAttribute('ry', 2);
      rect.setAttribute('fill', colors[level]);
      rect.setAttribute('class', 'heatmap-cell');
      rect.setAttribute('data-date', dateStr);
      rect.setAttribute('data-value', value !== null ? value : '');
      rect.setAttribute('data-level', level);

      // Tooltip
      rect.addEventListener('mouseenter', (e) => {
        const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        let valText;
        if (value === null || value === undefined) {
          valText = 'No data';
        } else if (track.type === 'boolean') {
          valText = value ? 'Done' : 'Not done';
        } else {
          valText = `${value}${track.unit ? ' ' + track.unit : ''}`;
        }
        tooltip.textContent = `${formatted}: ${valText}`;
        tooltip.style.display = 'block';
        const containerRect = container.getBoundingClientRect();
        const cellRect = rect.getBoundingClientRect();
        tooltip.style.left = (cellRect.left - containerRect.left + CELL_SIZE / 2) + 'px';
        tooltip.style.top = (cellRect.top - containerRect.top - 30) + 'px';
      });

      rect.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      if (onCellClick) {
        rect.addEventListener('click', (e) => {
          const cellRect = rect.getBoundingClientRect();
          onCellClick(dateStr, value, cellRect);
        });
        rect.style.cursor = 'pointer';
      }

      svg.appendChild(rect);
    }

    container.innerHTML = '';
    container.style.position = 'relative';
    container.appendChild(svg);
    container.appendChild(tooltip);

    return svg;
  }

  // Update a single cell's color after logging
  function updateCell(container, date, value, track, isDark) {
    const colors = getColors(track.colorScheme, isDark);
    const level = getColorLevel(value, track);
    const cell = container.querySelector(`rect[data-date="${date}"]`);
    if (cell) {
      cell.setAttribute('fill', colors[level]);
      cell.setAttribute('data-value', value !== null ? value : '');
      cell.setAttribute('data-level', level);
      cell.classList.add('heatmap-cell-flash');
      setTimeout(() => cell.classList.remove('heatmap-cell-flash'), 400);
    }
  }

  return { render, updateCell, COLOR_SCHEMES, COLOR_SCHEMES_LIGHT, getDateStr, parseDate, buildDayGrid };
})();
