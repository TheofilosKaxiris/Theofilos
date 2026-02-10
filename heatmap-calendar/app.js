// app.js — Main application controller for Heatmap Calendar

const App = (() => {
  let currentTrackId = null;
  let viewMode = 'single'; // 'single' or 'multi'
  let rangeMode = 'rolling';
  let customYear = null;

  function init() {
    setupTheme();
    render();
    setupEventListeners();
    scheduleReminder();
  }

  // --- Theme ---

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function setupTheme() {
    const saved = localStorage.getItem('heatmap_theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    updateThemeButton();
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('heatmap_theme', isLight ? 'dark' : 'light');
    updateThemeButton();
    render();
  }

  function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark() ? '☀️' : '🌙';
  }

  // --- Main Render ---

  function render() {
    const tracks = Storage.getTracks();
    const container = document.getElementById('app-content');

    if (tracks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>Start tracking something</h2>
          <p>Create your first track to begin visualizing your daily habits</p>
          <button class="btn btn-primary" onclick="App.showNewTrackModal()">Create Track</button>
        </div>
      `;
      document.getElementById('track-tabs-container').innerHTML = '';
      return;
    }

    if (!currentTrackId || !tracks.find(t => t.id === currentTrackId)) {
      currentTrackId = tracks[0].id;
    }

    renderTrackTabs(tracks);

    if (viewMode === 'multi') {
      renderMultiTrackView(container, tracks);
    } else if (viewMode === 'review') {
      renderYearInReview(container, tracks);
    } else {
      renderSingleTrackView(container, tracks);
    }
  }

  function renderTrackTabs(tracks) {
    const tabsContainer = document.getElementById('track-tabs-container');
    tabsContainer.innerHTML = '';

    // View mode toggle
    const viewToggle = document.createElement('div');
    viewToggle.className = 'view-toggle';
    viewToggle.innerHTML = `
      <button class="${viewMode === 'single' ? 'active' : ''}" onclick="App.setViewMode('single')">Single</button>
      <button class="${viewMode === 'multi' ? 'active' : ''}" onclick="App.setViewMode('multi')">All Tracks</button>
      <button class="${viewMode === 'review' ? 'active' : ''}" onclick="App.setViewMode('review')">Year in Review</button>
    `;
    tabsContainer.appendChild(viewToggle);

    const tabs = document.createElement('div');
    tabs.className = 'track-tabs';

    if (viewMode === 'single') {
      for (const track of tracks) {
        const tab = document.createElement('button');
        tab.className = `track-tab ${track.id === currentTrackId ? 'active' : ''}`;
        tab.textContent = track.name;
        tab.onclick = () => { currentTrackId = track.id; render(); };
        tabs.appendChild(tab);
      }
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'track-tab track-tab-add';
    addBtn.textContent = '+';
    addBtn.title = 'New Track';
    addBtn.onclick = () => showNewTrackModal();
    tabs.appendChild(addBtn);

    tabsContainer.appendChild(tabs);
  }

  // --- Single Track View ---

  function renderSingleTrackView(container, tracks) {
    const track = tracks.find(t => t.id === currentTrackId);
    if (!track) return;
    const entries = Storage.getEntries(track.id);

    container.innerHTML = `
      <div class="track-section-header">
        <h2>${escapeHtml(track.name)}</h2>
        <div class="track-actions">
          <button class="btn btn-sm" onclick="App.editTrack('${track.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="App.confirmDeleteTrack('${track.id}')">Delete</button>
        </div>
      </div>
      <div id="quick-log"></div>
      <div id="range-controls"></div>
      <div class="heatmap-section">
        <div class="heatmap-wrapper" id="heatmap-container"></div>
      </div>
      <div id="stats-cards" class="stat-cards"></div>
      <div id="monthly-chart"></div>
      <div id="log-history"></div>
      <div id="import-export" class="import-export-section"></div>
      ${tracks.length >= 2 ? '<div id="comparison-panel" class="comparison-panel"></div>' : ''}
    `;

    renderQuickLog(track, entries);
    renderRangeControls();
    renderHeatmap(track, entries);
    renderStats(track, entries);
    renderLogHistory(track, entries);
    renderImportExport(track);

    if (tracks.length >= 2) {
      renderComparisonPanel(tracks, track);
    }
  }

  // --- Multi-Track View ---

  function renderMultiTrackView(container, tracks) {
    container.innerHTML = '<div class="multi-track-view" id="multi-view"></div>';
    const multiView = document.getElementById('multi-view');

    for (const track of tracks) {
      const entries = Storage.getEntries(track.id);
      const section = document.createElement('div');
      section.className = 'track-section';
      section.innerHTML = `
        <div class="track-section-header">
          <h2>${escapeHtml(track.name)}</h2>
          <div class="track-actions">
            <button class="btn btn-sm" onclick="App.setViewMode('single'); App.selectTrack('${track.id}')">View</button>
          </div>
        </div>
        <div class="heatmap-wrapper" id="heatmap-${track.id}"></div>
        <div class="stat-cards" id="stats-${track.id}"></div>
      `;
      multiView.appendChild(section);

      const stats = Stats.calculateStats(track, entries);
      Heatmap.render(
        document.getElementById(`heatmap-${track.id}`),
        track, entries,
        { isDark: isDark(), rangeMode, customYear, onCellClick: (date, val, rect) => showCellPopup(track, date, val, rect), compact: true }
      );
      Stats.renderStatCards(document.getElementById(`stats-${track.id}`), track, stats);
    }

    // Import/Export for all
    const ioSection = document.createElement('div');
    ioSection.className = 'import-export-section';
    ioSection.innerHTML = `
      <button class="btn" onclick="App.exportAllJSON()">Export All (JSON)</button>
      <button class="btn" onclick="App.triggerImportJSON()">Import JSON</button>
    `;
    multiView.appendChild(ioSection);
  }

  // --- Quick Log ---

  function renderQuickLog(track, entries) {
    const el = document.getElementById('quick-log');
    const today = Heatmap.getDateStr(new Date());
    const todayValue = entries[today];
    const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    if (track.type === 'boolean') {
      const isActive = !!todayValue;
      el.innerHTML = `
        <div class="quick-log-bar">
          <div>
            <div class="today-label">Today</div>
            <div class="today-date">${todayFormatted}</div>
          </div>
          <div style="flex:1"></div>
          <button class="quick-log-toggle ${isActive ? 'active' : ''}" onclick="App.toggleToday()" title="${isActive ? 'Mark as not done' : 'Mark as done'}"></button>
          <span class="today-label">${isActive ? 'Done!' : 'Not done'}</span>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="quick-log-bar">
          <div>
            <div class="today-label">Today</div>
            <div class="today-date">${todayFormatted}</div>
          </div>
          <div style="flex:1"></div>
          <input type="number" id="quick-log-input" value="${todayValue !== null && todayValue !== undefined ? todayValue : ''}" placeholder="0" min="0" step="any">
          <span class="unit-label">${escapeHtml(track.unit || '')}</span>
          <button class="btn btn-primary btn-sm" onclick="App.logToday()">Log</button>
        </div>
      `;
    }
  }

  function toggleToday() {
    const track = Storage.getTrack(currentTrackId);
    if (!track) return;
    const today = Heatmap.getDateStr(new Date());
    const current = Storage.getEntry(currentTrackId, today);
    const newVal = current ? 0 : 1;
    Storage.setEntry(currentTrackId, today, newVal);
    checkStreakMilestone(currentTrackId);
    render();
  }

  function logToday() {
    const input = document.getElementById('quick-log-input');
    if (!input) return;
    const val = parseFloat(input.value);
    if (isNaN(val)) return;
    const today = Heatmap.getDateStr(new Date());
    Storage.setEntry(currentTrackId, today, val);
    checkStreakMilestone(currentTrackId);
    render();
  }

  // --- Range Controls ---

  function renderRangeControls() {
    const el = document.getElementById('range-controls');
    const currentYear = new Date().getFullYear();
    el.innerHTML = `
      <div class="range-controls">
        <select id="range-select" onchange="App.changeRange(this.value)">
          <option value="rolling" ${rangeMode === 'rolling' ? 'selected' : ''}>Last 365 days</option>
          <option value="6months" ${rangeMode === '6months' ? 'selected' : ''}>Last 6 months</option>
          <option value="year" ${rangeMode === 'year' ? 'selected' : ''}>Calendar year</option>
        </select>
        ${rangeMode === 'year' ? `<input type="number" id="year-input" value="${customYear || currentYear}" min="2000" max="${currentYear}" onchange="App.changeYear(this.value)" style="width:80px">` : ''}
      </div>
    `;
  }

  function changeRange(mode) {
    rangeMode = mode;
    if (mode === 'year' && !customYear) {
      customYear = new Date().getFullYear();
    }
    render();
  }

  function changeYear(year) {
    customYear = parseInt(year);
    render();
  }

  // --- Heatmap ---

  function renderHeatmap(track, entries) {
    const container = document.getElementById('heatmap-container');
    Heatmap.render(container, track, entries, {
      isDark: isDark(),
      rangeMode,
      customYear,
      onCellClick: (date, value, rect) => showCellPopup(track, date, value, rect),
    });
  }

  // --- Cell Popup ---

  function showCellPopup(track, date, value, cellRect) {
    closeCellPopup();

    const overlay = document.createElement('div');
    overlay.className = 'cell-popup-overlay';
    overlay.onclick = closeCellPopup;

    const popup = document.createElement('div');
    popup.className = 'cell-popup';
    popup.id = 'cell-popup';

    const formatted = Heatmap.parseDate(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    if (track.type === 'boolean') {
      const isActive = !!value;
      popup.innerHTML = `
        <h4>${formatted}</h4>
        <div style="margin-bottom:12px">${isActive ? 'Logged as done' : 'No entry'}</div>
        <div class="popup-actions">
          <button class="btn btn-sm btn-primary" onclick="App.setCellValue('${track.id}', '${date}', ${isActive ? 0 : 1})">${isActive ? 'Remove' : 'Mark Done'}</button>
          <button class="btn btn-sm" onclick="App.closeCellPopup()">Cancel</button>
        </div>
      `;
    } else {
      popup.innerHTML = `
        <h4>${formatted}</h4>
        <input type="number" id="cell-value-input" value="${value !== null && value !== undefined ? value : ''}" placeholder="Enter value" min="0" step="any" autofocus>
        <div class="popup-actions">
          <button class="btn btn-sm btn-primary" onclick="App.saveCellValue('${track.id}', '${date}')">Save</button>
          ${value !== null && value !== undefined ? `<button class="btn btn-sm btn-danger" onclick="App.deleteCellValue('${track.id}', '${date}')">Delete</button>` : ''}
          <button class="btn btn-sm" onclick="App.closeCellPopup()">Cancel</button>
        </div>
      `;
    }

    // Position near the cell
    popup.style.left = Math.min(cellRect.left, window.innerWidth - 250) + 'px';
    popup.style.top = (cellRect.bottom + 8) + 'px';

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    const input = document.getElementById('cell-value-input');
    if (input) {
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveCellValue(track.id, date);
        if (e.key === 'Escape') closeCellPopup();
      });
    }
  }

  function closeCellPopup() {
    const popup = document.getElementById('cell-popup');
    const overlay = document.querySelector('.cell-popup-overlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
  }

  function setCellValue(trackId, date, value) {
    if (value === 0 || value === null) {
      Storage.deleteEntry(trackId, date);
    } else {
      Storage.setEntry(trackId, date, value);
    }
    closeCellPopup();
    checkStreakMilestone(trackId);
    render();
  }

  function saveCellValue(trackId, date) {
    const input = document.getElementById('cell-value-input');
    if (!input) return;
    const val = parseFloat(input.value);
    if (isNaN(val)) return;
    Storage.setEntry(trackId, date, val);
    closeCellPopup();
    checkStreakMilestone(trackId);
    render();
  }

  function deleteCellValue(trackId, date) {
    Storage.deleteEntry(trackId, date);
    closeCellPopup();
    render();
  }

  // --- Stats ---

  function renderStats(track, entries) {
    const stats = Stats.calculateStats(track, entries);
    Stats.renderStatCards(document.getElementById('stats-cards'), track, stats);
    Stats.renderMonthlyChart(document.getElementById('monthly-chart'), track, stats);
  }

  // --- Log History ---

  function renderLogHistory(track, entries) {
    const container = document.getElementById('log-history');
    const sorted = Object.entries(entries)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 30);

    if (sorted.length === 0) {
      container.innerHTML = '<div class="log-history"><h3>Recent Entries</h3><p style="color:var(--text-secondary);font-size:14px;margin-top:8px">No entries yet. Click a day on the heatmap or use the quick log above.</p></div>';
      return;
    }

    let html = '<div class="log-history"><h3>Recent Entries</h3>';
    for (const [date, value] of sorted) {
      const d = Heatmap.parseDate(date);
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      let valStr;
      if (track.type === 'boolean') {
        valStr = value ? 'Done' : '—';
      } else {
        valStr = `${value}${track.unit ? ' ' + track.unit : ''}`;
      }
      html += `
        <div class="log-entry">
          <span class="log-entry-date">${formatted}</span>
          <span class="log-entry-value">${escapeHtml(String(valStr))}</span>
          <div class="log-entry-actions">
            <button class="btn-icon" onclick="App.editEntry('${track.id}', '${date}', ${typeof value === 'number' ? value : (value ? 1 : 0)})" title="Edit">✏️</button>
            <button class="btn-icon" onclick="App.deleteEntry('${track.id}', '${date}')" title="Delete">🗑️</button>
          </div>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function editEntry(trackId, date, currentValue) {
    const track = Storage.getTrack(trackId);
    if (!track) return;
    const rect = { left: window.innerWidth / 2 - 110, bottom: window.innerHeight / 2 - 50, top: window.innerHeight / 2 - 50 };
    showCellPopup(track, date, currentValue, rect);
  }

  function deleteEntry(trackId, date) {
    Storage.deleteEntry(trackId, date);
    render();
  }

  // --- Import / Export ---

  function renderImportExport(track) {
    const el = document.getElementById('import-export');
    el.innerHTML = `
      <button class="btn" onclick="App.exportAllJSON()">Export All (JSON)</button>
      <button class="btn" onclick="App.exportCSV('${track.id}')">Export CSV</button>
      <button class="btn" onclick="App.triggerImportJSON()">Import JSON</button>
      <button class="btn" onclick="App.triggerImportCSV('${track.id}')">Import CSV</button>
      <button class="btn" onclick="App.shareAsImage()">Share as Image</button>
    `;
  }

  function exportAllJSON() {
    const json = Storage.exportAllJSON();
    downloadFile('heatmap-data.json', json, 'application/json');
    showNotification('Exported all data as JSON', 'success');
  }

  function exportCSV(trackId) {
    const track = Storage.getTrack(trackId);
    const csv = Storage.exportTrackCSV(trackId);
    downloadFile(`${track.name.toLowerCase().replace(/\s+/g, '-')}.csv`, csv, 'text/csv');
    showNotification('Exported CSV', 'success');
  }

  function triggerImportJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          Storage.importJSON(ev.target.result);
          showNotification('Data imported successfully', 'success');
          render();
        } catch (err) {
          showNotification('Import failed: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function triggerImportCSV(trackId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          Storage.importCSV(trackId, ev.target.result);
          showNotification('CSV imported successfully', 'success');
          render();
        } catch (err) {
          showNotification('CSV import failed: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function shareAsImage() {
    const heatmapEl = document.querySelector('.heatmap-wrapper');
    if (!heatmapEl) return;
    const svg = heatmapEl.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.fillStyle = isDark() ? '#0d1117' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showNotification('Heatmap copied to clipboard!', 'success');
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'heatmap.png';
          a.click();
          showNotification('Heatmap downloaded as PNG', 'success');
        }
      }, 'image/png');
    };
    img.src = url;
  }

  // --- Comparison Panel ---

  function renderComparisonPanel(tracks, currentTrack) {
    const panel = document.getElementById('comparison-panel');
    if (!panel || tracks.length < 2) return;

    const otherTracks = tracks.filter(t => t.id !== currentTrack.id);
    const defaultOther = otherTracks[0];

    panel.innerHTML = `
      <h3 class="chart-title">Compare Tracks</h3>
      <div class="comparison-selectors">
        <span>${escapeHtml(currentTrack.name)}</span>
        <span class="vs-label">vs</span>
        <select id="compare-track-select" onchange="App.updateComparison()">
          ${otherTracks.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('')}
        </select>
      </div>
      <div id="comparison-chart"></div>
    `;

    updateComparison();
  }

  function updateComparison() {
    const select = document.getElementById('compare-track-select');
    if (!select) return;
    const otherTrackId = select.value;
    const track1 = Storage.getTrack(currentTrackId);
    const track2 = Storage.getTrack(otherTrackId);
    if (!track1 || !track2) return;

    const entries1 = Storage.getEntries(track1.id);
    const entries2 = Storage.getEntries(track2.id);
    const stats1 = Stats.calculateStats(track1, entries1);
    const stats2 = Stats.calculateStats(track2, entries2);

    Stats.renderComparisonChart(
      document.getElementById('comparison-chart'),
      track1, entries1, stats1,
      track2, entries2, stats2
    );
  }

  // --- Track CRUD Modals ---

  function showNewTrackModal() {
    showTrackModal(null);
  }

  function editTrack(trackId) {
    const track = Storage.getTrack(trackId);
    if (track) showTrackModal(track);
  }

  function showTrackModal(existingTrack) {
    closeModal();
    const isEdit = !!existingTrack;
    const schemes = ['green', 'blue', 'purple', 'orange', 'red'];
    const currentScheme = existingTrack ? existingTrack.colorScheme : 'green';
    const colorSchemes = isDark() ? Heatmap.COLOR_SCHEMES : Heatmap.COLOR_SCHEMES_LIGHT;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h2>${isEdit ? 'Edit Track' : 'New Track'}</h2>
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="track-name" value="${isEdit ? escapeHtml(existingTrack.name) : ''}" placeholder="e.g., Exercise, Reading">
      </div>
      <div class="form-group">
        <label>Type</label>
        <select id="track-type" onchange="App.onTrackTypeChange()">
          <option value="boolean" ${(!isEdit || existingTrack.type === 'boolean') ? 'selected' : ''}>Boolean (done / not done)</option>
          <option value="numeric" ${(isEdit && existingTrack.type === 'numeric') ? 'selected' : ''}>Numeric (enter a number)</option>
        </select>
      </div>
      <div class="form-group" id="unit-group" style="display:${(isEdit && existingTrack.type === 'numeric') ? 'block' : 'none'}">
        <label>Unit (optional)</label>
        <input type="text" id="track-unit" value="${isEdit ? escapeHtml(existingTrack.unit || '') : ''}" placeholder="e.g., minutes, pages, glasses">
      </div>
      <div class="form-group" id="goal-group" style="display:${(isEdit && existingTrack.type === 'numeric') ? 'block' : 'none'}">
        <label>Daily Goal (optional)</label>
        <input type="number" id="track-goal" value="${isEdit && existingTrack.goal ? existingTrack.goal : ''}" placeholder="e.g., 30" min="0" step="any">
      </div>
      <div class="form-group">
        <label>Color Scheme</label>
        <div class="color-scheme-options" id="color-scheme-options">
          ${schemes.map(s => `
            <div class="color-scheme-option ${s === currentScheme ? 'selected' : ''}" data-scheme="${s}" onclick="App.selectColorScheme('${s}')">
              ${colorSchemes[s].slice(1).map(c => `<div class="color-swatch" style="background:${c}"></div>`).join('')}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="form-actions">
        <button class="btn" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="App.saveTrack(${isEdit ? `'${existingTrack.id}'` : 'null'})">${isEdit ? 'Save' : 'Create'}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('track-name').focus();
  }

  function onTrackTypeChange() {
    const type = document.getElementById('track-type').value;
    document.getElementById('unit-group').style.display = type === 'numeric' ? 'block' : 'none';
    document.getElementById('goal-group').style.display = type === 'numeric' ? 'block' : 'none';
  }

  let selectedColorScheme = 'green';

  function selectColorScheme(scheme) {
    selectedColorScheme = scheme;
    document.querySelectorAll('.color-scheme-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.scheme === scheme);
    });
  }

  function saveTrack(existingId) {
    const name = document.getElementById('track-name').value.trim();
    if (!name) {
      showNotification('Please enter a track name', 'error');
      return;
    }
    const type = document.getElementById('track-type').value;
    const unit = document.getElementById('track-unit')?.value.trim() || '';
    const goal = document.getElementById('track-goal')?.value || null;

    if (existingId) {
      Storage.updateTrack(existingId, { name, type, unit, colorScheme: selectedColorScheme, goal });
    } else {
      const track = Storage.createTrack({ name, type, unit, colorScheme: selectedColorScheme, goal });
      currentTrackId = track.id;
    }

    closeModal();
    render();
  }

  function confirmDeleteTrack(trackId) {
    const track = Storage.getTrack(trackId);
    if (!track) return;
    closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h2>Delete Track</h2>
      <p style="margin-bottom:16px">Are you sure you want to delete <strong>${escapeHtml(track.name)}</strong>? This will remove all entries for this track. This action cannot be undone.</p>
      <div class="form-actions">
        <button class="btn" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="App.doDeleteTrack('${trackId}')">Delete</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function doDeleteTrack(trackId) {
    Storage.deleteTrack(trackId);
    currentTrackId = null;
    closeModal();
    render();
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.remove();
  }

  // --- View Mode ---

  function setViewMode(mode) {
    viewMode = mode;
    render();
  }

  function selectTrack(trackId) {
    currentTrackId = trackId;
    render();
  }

  // --- Notifications ---

  function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // --- Confetti ---

  function showConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const particles = [];
    const colors = ['#f85149', '#3fb950', '#58a6ff', '#d29922', '#b87afc', '#f0b840'];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      frame++;
      if (frame < 150) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    animate();
  }

  // Streak milestones
  const MILESTONES = [7, 30, 50, 100, 200, 365];
  let lastCelebratedStreak = {};

  function checkStreakMilestone(trackId) {
    const track = Storage.getTrack(trackId);
    const entries = Storage.getEntries(trackId);
    const stats = Stats.calculateStats(track, entries);
    const streak = stats.currentStreak;

    for (const milestone of MILESTONES) {
      if (streak === milestone && lastCelebratedStreak[trackId] !== milestone) {
        lastCelebratedStreak[trackId] = milestone;
        showConfetti();
        showNotification(`${milestone}-day streak! Keep it up!`, 'success');
        break;
      }
    }
  }

  // --- Event Listeners ---

  function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCellPopup();
        closeModal();
      }
    });
  }

  // --- Helpers ---

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Year in Review ---

  function renderYearInReview(container, tracks) {
    const year = customYear || new Date().getFullYear();
    container.innerHTML = `
      <div class="year-review">
        <h2>${year} Year in Review</h2>
        <div class="range-controls" style="justify-content:center;margin-bottom:24px">
          <button class="btn btn-sm" onclick="App.changeReviewYear(${year - 1})">&larr; ${year - 1}</button>
          <span style="font-size:18px;font-weight:700;margin:0 16px">${year}</span>
          <button class="btn btn-sm" onclick="App.changeReviewYear(${year + 1})">${year + 1} &rarr;</button>
        </div>
        <div id="review-tracks"></div>
        <div id="review-summary" class="stat-cards" style="margin-top:24px"></div>
      </div>
    `;

    const reviewContainer = document.getElementById('review-tracks');
    const summaryContainer = document.getElementById('review-summary');

    let totalActiveDays = 0;
    let totalEntries = 0;
    let bestStreak = 0;
    let bestStreakTrack = '';

    for (const track of tracks) {
      const entries = Storage.getEntries(track.id);
      // Filter entries to just this year
      const yearEntries = {};
      for (const [date, val] of Object.entries(entries)) {
        if (date.startsWith(String(year))) yearEntries[date] = val;
      }

      const stats = Stats.calculateStats(track, yearEntries);

      const section = document.createElement('div');
      section.className = 'track-section';
      section.innerHTML = `
        <div class="track-section-header"><h2>${escapeHtml(track.name)}</h2></div>
        <div class="heatmap-wrapper" id="review-heatmap-${track.id}"></div>
        <div class="stat-cards" id="review-stats-${track.id}" style="margin-top:12px"></div>
      `;
      reviewContainer.appendChild(section);

      Heatmap.render(
        document.getElementById(`review-heatmap-${track.id}`),
        track, yearEntries,
        { isDark: isDark(), rangeMode: 'year', customYear: year }
      );
      Stats.renderStatCards(document.getElementById(`review-stats-${track.id}`), track, stats);

      totalActiveDays += stats.totalActiveDays;
      totalEntries += Object.keys(yearEntries).length;
      if (stats.longestStreak > bestStreak) {
        bestStreak = stats.longestStreak;
        bestStreakTrack = track.name;
      }
    }

    // Overall summary
    summaryContainer.innerHTML = `
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-value">${tracks.length}</div><div class="stat-label">Tracks</div></div>
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-value">${totalEntries}</div><div class="stat-label">Total Entries</div></div>
      <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value">${bestStreak} days</div><div class="stat-label">Best Streak (${escapeHtml(bestStreakTrack)})</div></div>
    `;
  }

  function changeReviewYear(year) {
    customYear = year;
    render();
  }

  // --- Reminders (Browser Notifications) ---

  function showReminderSettings() {
    closeModal();
    const savedTime = localStorage.getItem('heatmap_reminder_time') || '';
    const enabled = localStorage.getItem('heatmap_reminder_enabled') === 'true';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h2>Daily Reminder</h2>
      <p style="color:var(--text-secondary);margin-bottom:16px">Get a browser notification to remind you to log your daily activities.</p>
      <div class="form-group">
        <label>Reminder Time</label>
        <input type="time" id="reminder-time" value="${savedTime || '20:00'}">
      </div>
      <div class="form-group" style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" id="reminder-enabled" ${enabled ? 'checked' : ''} style="width:auto">
        <label for="reminder-enabled" style="margin:0">Enable daily reminder</label>
      </div>
      <div class="form-actions">
        <button class="btn" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="App.saveReminderSettings()">Save</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function saveReminderSettings() {
    const time = document.getElementById('reminder-time').value;
    const enabled = document.getElementById('reminder-enabled').checked;

    if (enabled && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          applyReminderSettings(time, true);
        } else {
          showNotification('Notification permission denied', 'error');
          applyReminderSettings(time, false);
        }
      });
    } else {
      applyReminderSettings(time, enabled);
    }
  }

  function applyReminderSettings(time, enabled) {
    localStorage.setItem('heatmap_reminder_time', time);
    localStorage.setItem('heatmap_reminder_enabled', String(enabled));
    closeModal();
    scheduleReminder();
    showNotification(enabled ? `Reminder set for ${time}` : 'Reminder disabled', 'success');
  }

  let reminderTimeout = null;

  function scheduleReminder() {
    if (reminderTimeout) clearTimeout(reminderTimeout);
    const enabled = localStorage.getItem('heatmap_reminder_enabled') === 'true';
    if (!enabled || Notification.permission !== 'granted') return;

    const time = localStorage.getItem('heatmap_reminder_time') || '20:00';
    const [hours, minutes] = time.split(':').map(Number);

    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target - now;
    reminderTimeout = setTimeout(() => {
      new Notification('Heatmap Calendar', {
        body: 'Time to log your daily activities!',
        icon: '📊',
      });
      // Schedule next day
      scheduleReminder();
    }, delay);
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return {
    init,
    render,
    toggleTheme,
    showNewTrackModal,
    editTrack,
    confirmDeleteTrack,
    doDeleteTrack,
    saveTrack,
    closeModal,
    toggleToday,
    logToday,
    setCellValue,
    saveCellValue,
    deleteCellValue,
    closeCellPopup,
    changeRange,
    changeYear,
    setViewMode,
    selectTrack,
    exportAllJSON,
    exportCSV,
    triggerImportJSON,
    triggerImportCSV,
    shareAsImage,
    onTrackTypeChange,
    selectColorScheme,
    updateComparison,
    editEntry,
    deleteEntry,
    changeReviewYear,
    showReminderSettings,
    saveReminderSettings,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
