(function(){
"use strict";

// ==================== STATE ====================
const state = {
  companies: [],
  bySicCode: new Map(),
  bySicDescription: new Map(),
  byState: new Map(),
  byExchange: new Map(),
  industries: [],        // {sicDescription, sicCode, count, division}
  selectedIndustry: null, // sicDescription or null for all
  selectedIndustryB: null,
  compareMode: false,
  selectedCompany: null,
  selectedState: null,
  sortCol: 'marketCap',
  sortDir: -1,
  tablePage: 0,
  tablePageSize: 50,
  tableFilter: '',
  recentIndustries: [],
  totalMarketCap: 0,
  treemapColorMode: 'scale',
  mapMode: 'count',
};

// ==================== DOM REFS ====================
const $ = (s) => document.querySelector(s);
const el = {
  loading: $('#loading'), error: $('#error-state'), errorMsg: $('#error-message'),
  main: $('#main-content'), dashboard: $('#dashboard'),
  search: $('#industry-search'), dropdown: $('#industry-dropdown'),
  recentSection: $('#recent-industries'), allSection: $('#all-industries'),
  searchB: $('#industry-search-b'), dropdownB: $('#industry-dropdown-b'),
  selectorB: $('#industry-selector-b'),
  compareBtn: $('#compare-toggle'), comparisonPanel: $('#comparison-panel'),
  statsCards: $('#stats-cards'),
  histCanvas: $('#histogram-canvas'), ipoCanvas: $('#ipo-canvas'),
  treemapCanvas: $('#treemap-canvas'), treemapContainer: $('#treemap-container'),
  treemapTooltip: $('#treemap-tooltip'), treemapColorMode: $('#treemap-color-mode'),
  tbody: $('#company-tbody'), tableSearch: $('#table-search'),
  csvBtn: $('#csv-export'), pagination: $('#table-pagination'),
  map: $('#us-map'), mapTooltip: $('#map-tooltip'), mapMode: $('#map-mode'),
  mapLegend: $('#map-legend'),
  detailPanel: $('#detail-panel'), detailOverlay: $('#detail-overlay'),
  detailContent: $('#detail-content'), detailClose: $('#detail-close'),
  detailPrev: $('#detail-prev'), detailNext: $('#detail-next'),
  globalStats: $('#global-stats'),
  compareTitle: $('#compare-title'),
  compareTitleA: $('#compare-a-title'), compareTitleB: $('#compare-b-title'),
  compareStats: $('#comparison-stats'),
  compareTreemapA: $('#treemap-canvas-a'), compareTreemapB: $('#treemap-canvas-b'),
  compareTableA: $('#compare-table-a'), compareTableB: $('#compare-table-b'),
};

// ==================== FORMATTING ====================
const fmt = {
  num: (n) => n == null ? '—' : new Intl.NumberFormat('en-US').format(n),
  cap: (n) => {
    if (n == null) return '—';
    if (n >= 1e12) return '$' + (n/1e12).toFixed(2) + 'T';
    if (n >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K';
    return '$' + n;
  },
  pct: (n) => (n*100).toFixed(1) + '%',
};

// ==================== SIC DIVISIONS ====================
const SIC_DIVISIONS = {
  '01-09': 'Agriculture',
  '10-14': 'Mining',
  '15-17': 'Construction',
  '20-39': 'Manufacturing',
  '40-49': 'Transportation & Utilities',
  '50-51': 'Wholesale Trade',
  '52-59': 'Retail Trade',
  '60-67': 'Finance & Insurance',
  '70-89': 'Services',
  '91-99': 'Public Administration',
};

function getDivision(sicCode) {
  if (!sicCode) return 'Other';
  const prefix = parseInt(String(sicCode).substring(0, 2), 10);
  if (prefix >= 1 && prefix <= 9) return 'Agriculture';
  if (prefix >= 10 && prefix <= 14) return 'Mining';
  if (prefix >= 15 && prefix <= 17) return 'Construction';
  if (prefix >= 20 && prefix <= 39) return 'Manufacturing';
  if (prefix >= 40 && prefix <= 49) return 'Transportation & Utilities';
  if (prefix >= 50 && prefix <= 51) return 'Wholesale Trade';
  if (prefix >= 52 && prefix <= 59) return 'Retail Trade';
  if (prefix >= 60 && prefix <= 67) return 'Finance & Insurance';
  if (prefix >= 70 && prefix <= 89) return 'Services';
  if (prefix >= 91 && prefix <= 99) return 'Public Administration';
  return 'Other';
}

// ==================== DATA LOADING ====================
async function loadData() {
  try {
    let resp = await fetch('companies.json');
    if (!resp.ok) {
      resp = await fetch('sample-companies.json');
      if (!resp.ok) throw new Error('Place companies.json in the same directory as index.html');
    }
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No companies found in the data file.');
    return data;
  } catch(e) {
    if (e instanceof SyntaxError) throw new Error('Invalid JSON in data file: ' + e.message);
    throw e;
  }
}

function buildIndices(companies) {
  state.companies = companies;
  state.bySicCode.clear(); state.bySicDescription.clear();
  state.byState.clear(); state.byExchange.clear();
  let totalCap = 0;

  for (const c of companies) {
    const sc = c.sicCode || 'Unknown';
    const sd = c.sicDescription || ('SIC ' + String(sc).substring(0,3) + 'xx');
    if (!state.bySicCode.has(sc)) state.bySicCode.set(sc, []);
    state.bySicCode.get(sc).push(c);
    if (!state.bySicDescription.has(sd)) state.bySicDescription.set(sd, []);
    state.bySicDescription.get(sd).push(c);
    const st = c.address && c.address.state ? c.address.state : 'Unknown';
    if (!state.byState.has(st)) state.byState.set(st, []);
    state.byState.get(st).push(c);
    const ex = c.primaryExchange || 'Other';
    if (!state.byExchange.has(ex)) state.byExchange.set(ex, []);
    state.byExchange.get(ex).push(c);
    totalCap += c.marketCap || 0;
  }
  state.totalMarketCap = totalCap;

  // Build industries list
  const indList = [];
  for (const [desc, arr] of state.bySicDescription) {
    const code = arr[0].sicCode || '0000';
    indList.push({ sicDescription: desc, sicCode: code, count: arr.length, division: getDivision(code) });
  }
  indList.sort((a,b) => b.count - a.count);
  state.industries = indList;

  el.globalStats.textContent = `${fmt.num(companies.length)} companies · ${indList.length} industries · ${fmt.cap(totalCap)} total`;
}

// ==================== INDUSTRY SELECTOR ====================
function renderDropdown(filter, dropdownEl, sectionAll, sectionRecent, onSelect) {
  const f = (filter || '').toLowerCase();
  // Group by division
  const byDiv = {};
  for (const ind of state.industries) {
    if (f && !ind.sicDescription.toLowerCase().includes(f) && !String(ind.sicCode).includes(f)) continue;
    if (!byDiv[ind.division]) byDiv[ind.division] = [];
    byDiv[ind.division].push(ind);
  }

  let html = '<div class="dropdown-item" data-value="">(All Industries — ' + state.companies.length + ' companies)</div>';
  const divOrder = ['Manufacturing','Finance & Insurance','Services','Retail Trade','Transportation & Utilities','Mining','Construction','Agriculture','Wholesale Trade','Public Administration','Other'];
  for (const div of divOrder) {
    if (!byDiv[div]) continue;
    html += '<div class="dropdown-divider"></div><div class="dropdown-label">' + div + '</div>';
    for (const ind of byDiv[div]) {
      html += '<div class="dropdown-item" data-value="' + escHtml(ind.sicDescription) + '">' +
        escHtml(ind.sicDescription) + ' <span class="count">(' + ind.count + ')</span></div>';
    }
  }

  if (sectionAll) sectionAll.innerHTML = html;
  else dropdownEl.innerHTML = html;

  // Recent
  if (sectionRecent && state.recentIndustries.length > 0 && !f) {
    sectionRecent.classList.remove('hidden');
    let rHtml = '<div class="dropdown-label">Recent</div>';
    for (const r of state.recentIndustries) {
      const ind = state.industries.find(i => i.sicDescription === r);
      if (ind) {
        rHtml += '<div class="dropdown-item" data-value="' + escHtml(r) + '">' +
          escHtml(r) + ' <span class="count">(' + ind.count + ')</span></div>';
      }
    }
    sectionRecent.innerHTML = rHtml;
  } else if (sectionRecent) {
    sectionRecent.classList.add('hidden');
  }

  // Click handlers
  const items = dropdownEl.querySelectorAll('.dropdown-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const v = item.dataset.value;
      onSelect(v || null);
      dropdownEl.classList.add('hidden');
    });
  });
}

function setupSelector(searchEl, dropdownEl, sectionAll, sectionRecent, onSelect) {
  searchEl.addEventListener('focus', () => {
    renderDropdown(searchEl.value, dropdownEl, sectionAll, sectionRecent, onSelect);
    dropdownEl.classList.remove('hidden');
  });
  searchEl.addEventListener('input', () => {
    renderDropdown(searchEl.value, dropdownEl, sectionAll, sectionRecent, onSelect);
    dropdownEl.classList.remove('hidden');
  });
  document.addEventListener('click', (e) => {
    if (!searchEl.parentElement.contains(e.target)) dropdownEl.classList.add('hidden');
  });
}

function selectIndustry(desc) {
  state.selectedIndustry = desc;
  state.selectedState = null;
  state.tablePage = 0;
  if (desc) {
    el.search.value = desc;
    state.recentIndustries = [desc, ...state.recentIndustries.filter(r => r !== desc)].slice(0, 5);
  } else {
    el.search.value = '';
  }
  if (!state.compareMode) renderAll();
}

function selectIndustryB(desc) {
  state.selectedIndustryB = desc;
  if (desc) el.searchB.value = desc;
  else el.searchB.value = '';
  if (state.compareMode) renderComparison();
}

// ==================== INDUSTRY DATA HELPERS ====================
function getCompanies(desc) {
  if (!desc) return [...state.companies];
  return state.bySicDescription.get(desc) || [];
}

function filterAndSort(companies) {
  let list = companies;
  // State filter
  if (state.selectedState) {
    list = list.filter(c => c.address && c.address.state === state.selectedState);
  }
  // Text filter
  if (state.tableFilter) {
    const f = state.tableFilter.toLowerCase();
    list = list.filter(c => (c.ticker||'').toLowerCase().includes(f) || (c.name||'').toLowerCase().includes(f));
  }
  // Sort
  list.sort((a,b) => {
    let va = a[state.sortCol], vb = b[state.sortCol];
    if (state.sortCol === 'state') { va = a.address?.state||''; vb = b.address?.state||''; }
    if (state.sortCol === 'rank') { va = a.marketCap||0; vb = b.marketCap||0; } // rank == marketCap desc by default
    if (typeof va === 'string') return state.sortDir * va.localeCompare(vb);
    return state.sortDir * ((va||0) - (vb||0));
  });
  return list;
}

function calcStats(companies) {
  const caps = companies.map(c => c.marketCap || 0).filter(v => v > 0).sort((a,b) => b - a);
  const totalCap = caps.reduce((s,v) => s + v, 0);
  const avgCap = caps.length ? totalCap / caps.length : 0;
  const medianCap = caps.length ? caps[Math.floor(caps.length/2)] : 0;
  const emps = companies.reduce((s,c) => s + (c.totalEmployees||0), 0);
  const activeCount = companies.filter(c => c.active !== false).length;
  const states = new Set(companies.map(c => c.address?.state).filter(Boolean));
  const exchangeCounts = {};
  for (const c of companies) { const ex = c.primaryExchange||'Other'; exchangeCounts[ex] = (exchangeCounts[ex]||0)+1; }
  // HHI
  let hhi = 0;
  if (totalCap > 0) {
    for (const cap of caps) {
      const share = (cap / totalCap) * 100;
      hhi += share * share;
    }
  }
  return {
    total: companies.length, active: activeCount, inactive: companies.length - activeCount,
    totalCap, avgCap, medianCap,
    largest: caps.length ? companies.find(c => (c.marketCap||0) === caps[0]) : null,
    smallest: caps.length ? companies.find(c => (c.marketCap||0) === caps[caps.length-1]) : null,
    totalEmployees: emps, hhi: Math.round(hhi), states: states.size,
    exchanges: exchangeCounts,
    pctOfTotal: state.totalMarketCap > 0 ? totalCap / state.totalMarketCap : 0,
  };
}

// ==================== RENDER ALL ====================
function renderAll() {
  const companies = getCompanies(state.selectedIndustry);
  renderStats(companies);
  renderTable(companies);
  renderTreemap(companies, el.treemapCanvas);
  renderMap(companies);
  renderHistogram(companies);
  renderIPO(companies);
}

// ==================== STATS CARDS ====================
function renderStats(companies) {
  const s = calcStats(companies);
  const hhiColor = s.hhi < 1500 ? 'var(--green)' : s.hhi < 2500 ? 'var(--yellow)' : 'var(--red)';
  const hhiLabel = s.hhi < 1500 ? 'Competitive' : s.hhi < 2500 ? 'Moderate' : 'Highly Concentrated';
  const exList = Object.entries(s.exchanges).map(([k,v])=> exchangeName(k)+': '+v).join(', ');

  const cards = [
    { icon:'🏢', label:'Total Companies', value: fmt.num(s.total), sub: s.active+' active, '+s.inactive+' inactive' },
    { icon:'💰', label:'Total Market Cap', value: fmt.cap(s.totalCap), sub: fmt.pct(s.pctOfTotal)+' of all' },
    { icon:'📊', label:'Average Market Cap', value: fmt.cap(s.avgCap), sub:'' },
    { icon:'📈', label:'Median Market Cap', value: fmt.cap(s.medianCap), sub:'' },
    { icon:'👑', label:'Largest Company', value: s.largest ? s.largest.ticker : '—', sub: s.largest ? s.largest.name+' · '+fmt.cap(s.largest.marketCap) : '' },
    { icon:'🔹', label:'Smallest Company', value: s.smallest ? s.smallest.ticker : '—', sub: s.smallest ? s.smallest.name+' · '+fmt.cap(s.smallest.marketCap) : '' },
    { icon:'👥', label:'Total Employees', value: fmt.num(s.totalEmployees), sub:'' },
    { icon:'📉', label:'HHI Index', value: fmt.num(s.hhi), sub:'<span style="color:'+hhiColor+'">'+hhiLabel+'</span>' },
    { icon:'🗺️', label:'States Represented', value: s.states, sub:'' },
    { icon:'🏦', label:'Exchanges', value: Object.keys(s.exchanges).length, sub: exList },
  ];

  el.statsCards.innerHTML = cards.map((c,i) =>
    `<div class="stat-card" style="animation-delay:${i*40}ms">
      <span class="stat-icon">${c.icon}</span>
      <span class="stat-label">${c.label}</span>
      <span class="stat-value">${c.value}</span>
      <span class="stat-sub">${c.sub}</span>
    </div>`
  ).join('');
}

// ==================== COMPANY TABLE ====================
function renderTable(allCompanies) {
  const sorted = filterAndSort(allCompanies);
  const total = sorted.length;
  const start = state.tablePage * state.tablePageSize;
  const page = sorted.slice(start, start + state.tablePageSize);

  // Assign ranks based on market cap sort (full sorted list)
  const ranked = [...allCompanies].sort((a,b) => (b.marketCap||0)-(a.marketCap||0));
  const rankMap = new Map();
  ranked.forEach((c,i) => rankMap.set(c, i+1));

  el.tbody.innerHTML = page.map(c => {
    const rank = rankMap.get(c) || '—';
    return `<tr data-ticker="${escHtml(c.ticker)}">
      <td>${rank}</td>
      <td class="ticker-cell">${escHtml(c.ticker)}</td>
      <td>${escHtml(c.name)}</td>
      <td>${fmt.cap(c.marketCap)}</td>
      <td>${c.totalEmployees ? fmt.num(c.totalEmployees) : '—'}</td>
      <td>${c.address?.state || '—'}</td>
      <td>${exchangeName(c.primaryExchange)}</td>
    </tr>`;
  }).join('');

  // Pagination
  const pages = Math.ceil(total / state.tablePageSize);
  if (pages <= 1) { el.pagination.innerHTML = ''; return; }
  let pHtml = '';
  for (let i = 0; i < pages && i < 10; i++) {
    pHtml += `<button class="${i===state.tablePage?'active':''}" data-page="${i}">${i+1}</button>`;
  }
  if (pages > 10) pHtml += `<span>...${pages} pages</span>`;
  el.pagination.innerHTML = pHtml;
  el.pagination.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => { state.tablePage = +btn.dataset.page; renderTable(allCompanies); });
  });

  // Row click
  el.tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      const c = state.companies.find(c => c.ticker === row.dataset.ticker);
      if (c) showDetail(c, allCompanies);
    });
  });
}

// Table sorting
document.querySelectorAll('#company-table th').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.sort;
    if (state.sortCol === col) state.sortDir *= -1;
    else { state.sortCol = col; state.sortDir = col === 'marketCap' || col === 'totalEmployees' ? -1 : 1; }
    // Update arrows
    document.querySelectorAll('#company-table th .sort-arrow').forEach(a => a.remove());
    th.insertAdjacentHTML('beforeend', `<span class="sort-arrow">${state.sortDir > 0 ? '▲' : '▼'}</span>`);
    state.tablePage = 0;
    renderTable(getCompanies(state.selectedIndustry));
  });
});

// Table search
el.tableSearch.addEventListener('input', debounce(() => {
  state.tableFilter = el.tableSearch.value;
  state.tablePage = 0;
  renderTable(getCompanies(state.selectedIndustry));
}, 200));

// CSV export
el.csvBtn.addEventListener('click', () => {
  const companies = filterAndSort(getCompanies(state.selectedIndustry));
  const rows = [['Ticker','Name','Market Cap','Employees','State','Exchange']];
  for (const c of companies) {
    rows.push([c.ticker, c.name, c.marketCap||'', c.totalEmployees||'', c.address?.state||'', c.primaryExchange||'']);
  }
  const csv = rows.map(r => r.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  navigator.clipboard.writeText(csv).then(() => {
    el.csvBtn.textContent = '✓ Copied!';
    setTimeout(() => el.csvBtn.textContent = '📋 CSV', 1500);
  });
});

// ==================== TREEMAP ====================
function squarify(values, x, y, w, h) {
  const rects = [];
  if (!values.length || w <= 0 || h <= 0) return rects;
  const total = values.reduce((s,v) => s + v.value, 0);
  if (total <= 0) return rects;

  const items = values.map(v => ({...v, area: (v.value / total) * w * h}));
  layoutStrip(items, x, y, w, h, rects);
  return rects;
}

function layoutStrip(items, x, y, w, h, rects) {
  if (items.length === 0) return;
  if (items.length === 1) {
    rects.push({...items[0], x, y, w, h});
    return;
  }

  const totalArea = items.reduce((s,i) => s + i.area, 0);
  const isWide = w >= h;
  const side = isWide ? h : w;
  let strip = [];
  let stripArea = 0;
  let bestRatio = Infinity;

  for (let i = 0; i < items.length; i++) {
    const testStrip = [...strip, items[i]];
    const testArea = stripArea + items[i].area;
    const ratio = worstRatio(testStrip, testArea, side);

    if (ratio <= bestRatio) {
      strip = testStrip;
      stripArea = testArea;
      bestRatio = ratio;
    } else {
      // Layout the strip
      const stripLen = stripArea / side;
      let offset = 0;
      for (const s of strip) {
        const segLen = s.area / stripLen;
        if (isWide) {
          rects.push({...s, x: x, y: y + offset, w: stripLen, h: segLen});
        } else {
          rects.push({...s, x: x + offset, y: y, w: segLen, h: stripLen});
        }
        offset += segLen;
      }
      // Recurse with remaining
      if (isWide) {
        layoutStrip(items.slice(i), x + stripLen, y, w - stripLen, h, rects);
      } else {
        layoutStrip(items.slice(i), x, y + stripLen, w, h - stripLen, rects);
      }
      return;
    }
  }

  // Layout final strip
  const stripLen = stripArea / side;
  let offset = 0;
  for (const s of strip) {
    const segLen = s.area / stripLen;
    if (isWide) {
      rects.push({...s, x: x, y: y + offset, w: stripLen, h: segLen});
    } else {
      rects.push({...s, x: x + offset, y: y, w: segLen, h: stripLen});
    }
    offset += segLen;
  }
}

function worstRatio(strip, totalArea, side) {
  const stripLen = totalArea / side;
  let worst = 0;
  for (const s of strip) {
    const segLen = s.area / stripLen;
    const r = Math.max(stripLen / segLen, segLen / stripLen);
    if (r > worst) worst = r;
  }
  return worst;
}

const EXCHANGE_COLORS = { XNYS:'#3b82f6', XNAS:'#22c55e', XASE:'#eab308', BATS:'#f97316', OTC:'#a855f7' };

function renderTreemap(companies, canvas) {
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const cw = container.clientWidth - 16;
  const ch = container.clientHeight - 16 || 340;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);

  const sorted = companies.filter(c => c.marketCap > 0).sort((a,b) => (b.marketCap||0) - (a.marketCap||0));
  if (!sorted.length) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data to display', cw/2, ch/2);
    return [];
  }

  const values = sorted.map((c, i) => ({ label: c.ticker, value: c.marketCap, company: c, index: i }));
  const rects = squarify(values, 2, 2, cw - 4, ch - 4);

  const maxCap = sorted[0].marketCap;
  for (const r of rects) {
    // Color
    let color;
    if (state.treemapColorMode === 'exchange') {
      color = EXCHANGE_COLORS[r.company.primaryExchange] || '#6366f1';
    } else {
      const t = Math.pow(r.value / maxCap, 0.4);
      const h = 210 + (1 - t) * 30;
      const s = 60 + t * 30;
      const l = 20 + t * 35;
      color = `hsl(${h},${s}%,${l}%)`;
    }

    ctx.fillStyle = color;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    // Label
    if (r.w > 40 && r.h > 24) {
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.min(14, Math.max(9, r.w / 6));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(r.label, r.x + r.w/2, r.y + r.h/2 - (r.h > 36 ? 6 : 0), r.w - 6);
      if (r.w > 50 && r.h > 36) {
        ctx.font = `${fontSize - 2}px sans-serif`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(fmt.cap(r.value), r.x + r.w/2, r.y + r.h/2 + fontSize - 2, r.w - 6);
      }
    }
  }

  // Store rects for hover/click
  canvas._rects = rects;
  canvas._companies = companies;
  return rects;
}

function setupTreemapInteraction(canvas, tooltipEl) {
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left);
    const my = (e.clientY - rect.top);
    const rects = canvas._rects || [];
    const totalCap = (canvas._companies||[]).reduce((s,c) => s + (c.marketCap||0), 0);

    let found = null;
    for (const r of rects) {
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) { found = r; break; }
    }
    if (found) {
      const pct = totalCap > 0 ? ((found.value / totalCap) * 100).toFixed(1) + '%' : '';
      tooltipEl.innerHTML = `<strong>${escHtml(found.company.name)}</strong><br>${found.label} · ${fmt.cap(found.value)} · ${pct}`;
      tooltipEl.style.left = (e.clientX - canvas.parentElement.getBoundingClientRect().left + 12) + 'px';
      tooltipEl.style.top = (e.clientY - canvas.parentElement.getBoundingClientRect().top - 10) + 'px';
      tooltipEl.classList.remove('hidden');
      canvas.style.cursor = 'pointer';
    } else {
      tooltipEl.classList.add('hidden');
      canvas.style.cursor = 'default';
    }
  });

  canvas.addEventListener('mouseleave', () => tooltipEl.classList.add('hidden'));

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const rects = canvas._rects || [];
    for (const r of rects) {
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        showDetail(r.company, canvas._companies || []);
        break;
      }
    }
  });
}

el.treemapColorMode.addEventListener('change', () => {
  state.treemapColorMode = el.treemapColorMode.value;
  renderTreemap(getCompanies(state.selectedIndustry), el.treemapCanvas);
});

// ==================== US STATE MAP ====================
// Simplified US state SVG paths
const US_STATES = {
  AL:{n:"Alabama",p:"M628,466 L628,420 L674,418 L678,472 L663,488 L656,480 L652,487 L637,487Z"},
  AK:{n:"Alaska",p:"M161,485 L183,485 L183,510 L198,510 L198,530 L161,530Z"},
  AZ:{n:"Arizona",p:"M205,410 L262,410 L270,490 L215,490 L197,460Z"},
  AR:{n:"Arkansas",p:"M575,420 L625,418 L627,465 L573,467Z"},
  CA:{n:"California",p:"M120,290 L165,290 L195,350 L197,460 L160,465 L118,400Z"},
  CO:{n:"Colorado",p:"M280,310 L370,310 L370,375 L280,375Z"},
  CT:{n:"Connecticut",p:"M845,228 L870,218 L878,240 L852,248Z"},
  DE:{n:"Delaware",p:"M815,305 L830,295 L835,320 L820,320Z"},
  FL:{n:"Florida",p:"M680,472 L740,460 L756,480 L756,540 L720,560 L695,530 L678,500 L663,490Z"},
  GA:{n:"Georgia",p:"M678,418 L728,410 L740,458 L680,470Z"},
  HI:{n:"Hawaii",p:"M260,520 L295,510 L300,530 L268,535Z"},
  ID:{n:"Idaho",p:"M215,180 L260,180 L265,280 L230,280 L215,240Z"},
  IL:{n:"Illinois",p:"M580,270 L618,270 L625,370 L595,375 L575,340Z"},
  IN:{n:"Indiana",p:"M620,270 L660,270 L662,365 L625,368Z"},
  IA:{n:"Iowa",p:"M510,250 L578,248 L580,310 L510,312Z"},
  KS:{n:"Kansas",p:"M390,345 L500,343 L500,400 L390,402Z"},
  KY:{n:"Kentucky",p:"M625,370 L720,355 L730,380 L640,395Z"},
  LA:{n:"Louisiana",p:"M560,470 L610,468 L620,510 L590,530 L560,510Z"},
  ME:{n:"Maine",p:"M870,130 L900,120 L905,180 L875,190Z"},
  MD:{n:"Maryland",p:"M770,305 L815,295 L820,320 L775,325Z"},
  MA:{n:"Massachusetts",p:"M845,210 L890,200 L893,218 L848,225Z"},
  MI:{n:"Michigan",p:"M615,175 L660,160 L680,230 L670,268 L625,270 L612,230Z"},
  MN:{n:"Minnesota",p:"M480,140 L550,138 L555,245 L485,247Z"},
  MS:{n:"Mississippi",p:"M595,420 L628,418 L637,487 L600,490Z"},
  MO:{n:"Missouri",p:"M510,340 L575,338 L575,420 L510,420Z"},
  MT:{n:"Montana",p:"M260,130 L380,130 L380,200 L260,200Z"},
  NE:{n:"Nebraska",p:"M370,280 L500,278 L500,340 L390,342 L370,320Z"},
  NV:{n:"Nevada",p:"M165,245 L220,245 L205,410 L148,370Z"},
  NH:{n:"New Hampshire",p:"M860,145 L878,140 L875,195 L858,200Z"},
  NJ:{n:"New Jersey",p:"M828,260 L845,255 L845,310 L830,320 L822,300Z"},
  NM:{n:"New Mexico",p:"M262,410 L345,408 L350,500 L270,500Z"},
  NY:{n:"New York",p:"M770,180 L845,170 L845,250 L828,258 L790,250 L770,230Z"},
  NC:{n:"North Carolina",p:"M690,370 L790,358 L800,385 L708,400Z"},
  ND:{n:"North Dakota",p:"M380,135 L478,133 L480,200 L380,202Z"},
  OH:{n:"Ohio",p:"M665,265 L720,255 L725,340 L668,350Z"},
  OK:{n:"Oklahoma",p:"M370,390 L500,388 L500,438 L430,450 L380,445 L370,415Z"},
  OR:{n:"Oregon",p:"M118,175 L213,175 L215,260 L120,260Z"},
  PA:{n:"Pennsylvania",p:"M730,245 L825,237 L828,285 L735,292Z"},
  RI:{n:"Rhode Island",p:"M872,222 L885,218 L885,235 L872,238Z"},
  SC:{n:"South Carolina",p:"M708,400 L760,390 L770,420 L728,425Z"},
  SD:{n:"South Dakota",p:"M380,205 L480,203 L482,275 L380,278Z"},
  TN:{n:"Tennessee",p:"M600,385 L720,378 L725,405 L600,410Z"},
  TX:{n:"Texas",p:"M350,430 L500,425 L510,530 L460,560 L380,550 L350,500Z"},
  UT:{n:"Utah",p:"M230,280 L285,280 L285,385 L245,385 L230,340Z"},
  VT:{n:"Vermont",p:"M845,150 L862,145 L860,195 L845,200Z"},
  VA:{n:"Virginia",p:"M720,340 L800,330 L810,365 L730,378Z"},
  WA:{n:"Washington",p:"M135,110 L215,110 L220,180 L135,180Z"},
  WV:{n:"West Virginia",p:"M720,310 L755,300 L770,340 L740,355 L725,342Z"},
  WI:{n:"Wisconsin",p:"M535,160 L600,155 L612,240 L555,245Z"},
  WY:{n:"Wyoming",p:"M265,205 L370,203 L370,280 L265,282Z"},
};

function buildMap() {
  let svg = '';
  for (const [abbr, st] of Object.entries(US_STATES)) {
    svg += `<path id="state-${abbr}" d="${st.p}" data-state="${abbr}" data-name="${st.n}" fill="#1e293b"/>`;
  }
  el.map.innerHTML = svg;

  // Interaction
  el.map.querySelectorAll('path').forEach(path => {
    path.addEventListener('mouseenter', (e) => {
      const abbr = path.dataset.state;
      const companies = getCompanies(state.selectedIndustry).filter(c => c.address?.state === abbr);
      const totalCap = companies.reduce((s,c) => s + (c.marketCap||0), 0);
      const top3 = companies.sort((a,b) => (b.marketCap||0)-(a.marketCap||0)).slice(0,3).map(c => c.ticker).join(', ');
      el.mapTooltip.innerHTML = `<strong>${path.dataset.name} (${abbr})</strong><br>${companies.length} companies · ${fmt.cap(totalCap)}${top3 ? '<br>Top: '+top3 : ''}`;
      el.mapTooltip.classList.remove('hidden');
    });
    path.addEventListener('mousemove', (e) => {
      const mapRect = el.map.parentElement.getBoundingClientRect();
      el.mapTooltip.style.left = (e.clientX - mapRect.left + 12) + 'px';
      el.mapTooltip.style.top = (e.clientY - mapRect.top - 10) + 'px';
    });
    path.addEventListener('mouseleave', () => el.mapTooltip.classList.add('hidden'));
    path.addEventListener('click', () => {
      const abbr = path.dataset.state;
      if (state.selectedState === abbr) {
        state.selectedState = null;
      } else {
        state.selectedState = abbr;
      }
      // Highlight
      el.map.querySelectorAll('path').forEach(p => p.classList.remove('state-selected'));
      if (state.selectedState) path.classList.add('state-selected');
      state.tablePage = 0;
      renderTable(getCompanies(state.selectedIndustry));
    });
  });
}

function renderMap(companies) {
  const stateCounts = {};
  const stateCaps = {};
  for (const c of companies) {
    const st = c.address?.state;
    if (!st) continue;
    stateCounts[st] = (stateCounts[st]||0) + 1;
    stateCaps[st] = (stateCaps[st]||0) + (c.marketCap||0);
  }

  const vals = state.mapMode === 'count' ? stateCounts : stateCaps;
  const max = Math.max(...Object.values(vals), 1);

  for (const [abbr] of Object.entries(US_STATES)) {
    const path = document.getElementById('state-' + abbr);
    if (!path) continue;
    const v = vals[abbr] || 0;
    if (v === 0) {
      path.setAttribute('fill', '#1e293b');
    } else {
      const t = Math.pow(v / max, 0.5);
      const r = Math.round(30 + (59 - 30) * (1 - t));
      const g = Math.round(41 + (130 - 41) * t * 0.5);
      const b = Math.round(59 + (246 - 59) * t);
      path.setAttribute('fill', `rgb(${r},${g},${b})`);
    }
  }

  // Legend
  el.mapLegend.innerHTML = `<span>0</span><div class="legend-bar"></div><span>${state.mapMode === 'count' ? max : fmt.cap(max)}</span>`;
}

el.mapMode.addEventListener('change', () => {
  state.mapMode = el.mapMode.value;
  renderMap(getCompanies(state.selectedIndustry));
});

// ==================== HISTOGRAM ====================
function renderHistogram(companies) {
  const canvas = el.histCanvas;
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const cw = container.clientWidth - 24;
  const ch = 160;
  canvas.width = cw * dpr; canvas.height = ch * dpr;
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);

  const caps = companies.map(c => c.marketCap).filter(v => v > 0);
  if (caps.length < 2) { ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText('Not enough data', cw/2, ch/2); return; }

  const logCaps = caps.map(v => Math.log10(v));
  const minLog = Math.floor(Math.min(...logCaps));
  const maxLog = Math.ceil(Math.max(...logCaps));
  const bucketCount = Math.min(20, maxLog - minLog + 1);
  const bucketSize = (maxLog - minLog) / bucketCount;
  const buckets = new Array(bucketCount).fill(0);
  for (const l of logCaps) {
    const bi = Math.min(Math.floor((l - minLog) / bucketSize), bucketCount - 1);
    buckets[bi]++;
  }

  const maxBucket = Math.max(...buckets, 1);
  const pad = { l: 40, r: 10, t: 10, b: 30 };
  const pw = cw - pad.l - pad.r;
  const ph = ch - pad.t - pad.b;
  const bw = pw / bucketCount;

  // Bars
  for (let i = 0; i < bucketCount; i++) {
    const bh = (buckets[i] / maxBucket) * ph;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(pad.l + i * bw + 1, pad.t + ph - bh, bw - 2, bh);
  }

  // X axis labels
  ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
  for (let i = 0; i <= bucketCount; i += Math.max(1, Math.floor(bucketCount/5))) {
    const v = Math.pow(10, minLog + i * bucketSize);
    ctx.fillText(fmt.cap(v), pad.l + i * bw, ch - 5);
  }

  // Y axis
  ctx.textAlign = 'right';
  ctx.fillText(maxBucket, pad.l - 5, pad.t + 10);
  ctx.fillText('0', pad.l - 5, pad.t + ph);

  // Mean/Median lines
  const avg = caps.reduce((s,v)=>s+v,0)/caps.length;
  const sorted = [...caps].sort((a,b)=>a-b);
  const median = sorted[Math.floor(sorted.length/2)];
  for (const [val, color, label] of [[avg,'#eab308','Avg'],[median,'#22c55e','Med']]) {
    const logV = Math.log10(val);
    const x = pad.l + ((logV - minLog) / (maxLog - minLog)) * pw;
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + ph); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, x, pad.t - 2);
  }
}

// ==================== IPO TIMELINE ====================
function renderIPO(companies) {
  const canvas = el.ipoCanvas;
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const cw = container.clientWidth - 24;
  const ch = 160;
  canvas.width = cw * dpr; canvas.height = ch * dpr;
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);

  const dated = companies.filter(c => c.listDate).map(c => ({ ...c, year: new Date(c.listDate).getFullYear() })).filter(c => c.year > 1900);
  if (dated.length < 2) { ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText('Not enough data', cw/2, ch/2); return; }

  const years = dated.map(c => c.year);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const buckets = {};
  for (const y of years) buckets[y] = (buckets[y]||0) + 1;
  const maxCount = Math.max(...Object.values(buckets), 1);

  const pad = { l: 40, r: 10, t: 10, b: 30 };
  const pw = cw - pad.l - pad.r;
  const ph = ch - pad.t - pad.b;
  const range = maxY - minY + 1;
  const bw = Math.max(3, pw / range);

  for (let y = minY; y <= maxY; y++) {
    const count = buckets[y] || 0;
    const bh = (count / maxCount) * ph;
    const x = pad.l + ((y - minY) / range) * pw;
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(x, pad.t + ph - bh, Math.max(bw - 1, 2), bh);
  }

  ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(range / 6));
  for (let y = minY; y <= maxY; y += step) {
    const x = pad.l + ((y - minY) / range) * pw;
    ctx.fillText(y, x, ch - 5);
  }
  ctx.textAlign = 'right';
  ctx.fillText(maxCount, pad.l - 5, pad.t + 10);
}

// ==================== COMPANY DETAIL ====================
function showDetail(company, companiesList) {
  state.selectedCompany = company;
  el.detailPanel.classList.remove('hidden');
  el.detailOverlay.classList.remove('hidden');
  setTimeout(() => el.detailPanel.classList.add('open'), 10);

  // Find rank
  const sorted = [...companiesList].sort((a,b) => (b.marketCap||0)-(a.marketCap||0));
  const rank = sorted.indexOf(company) + 1;
  const industryName = company.sicDescription || 'this industry';
  const similar = (state.bySicCode.get(company.sicCode) || []).filter(c => c.ticker !== company.ticker).slice(0, 8);

  el.detailContent.innerHTML = `
    <div class="detail-ticker">${escHtml(company.ticker)}</div>
    <div class="detail-name">${escHtml(company.name)}</div>
    <div class="detail-grid">
      <div class="detail-item"><div class="d-label">Market Cap</div><div class="d-value">${fmt.cap(company.marketCap)}</div></div>
      <div class="detail-item"><div class="d-label">Employees</div><div class="d-value">${company.totalEmployees ? fmt.num(company.totalEmployees) : '—'}</div></div>
      <div class="detail-item"><div class="d-label">Exchange</div><div class="d-value">${exchangeName(company.primaryExchange)}</div></div>
      <div class="detail-item"><div class="d-label">Status</div><div class="d-value">${company.active !== false ? '🟢 Active' : '🔴 Inactive'}</div></div>
      <div class="detail-item"><div class="d-label">List Date</div><div class="d-value">${company.listDate || '—'}</div></div>
      <div class="detail-item"><div class="d-label">Location</div><div class="d-value">${company.address ? (company.address.city||'')+', '+(company.address.state||'') : '—'}</div></div>
    </div>
    <div class="detail-section">
      <h4>Industry</h4>
      <div style="font-size:.9rem">${escHtml(company.sicDescription||'')} (SIC ${company.sicCode||'—'})</div>
    </div>
    ${company.description ? '<div class="detail-section"><h4>Description</h4><div class="detail-description">'+escHtml(company.description)+'</div></div>' : ''}
    ${company.homepageUrl ? '<div class="detail-section"><h4>Website</h4><a href="'+escHtml(company.homepageUrl)+'" target="_blank" rel="noopener">'+escHtml(company.homepageUrl)+'</a></div>' : ''}
    <div class="detail-rank">#${rank} of ${sorted.length} in ${escHtml(industryName)} by market cap</div>
    ${similar.length ? '<div class="detail-section"><h4>Similar Companies</h4><div class="similar-list">' +
      similar.map(c => `<div class="similar-item" data-ticker="${escHtml(c.ticker)}"><span style="color:var(--accent2);font-weight:600">${escHtml(c.ticker)}</span><span>${escHtml(c.name)}</span><span>${fmt.cap(c.marketCap)}</span></div>`).join('') +
      '</div></div>' : ''}
  `;

  // Similar company click
  el.detailContent.querySelectorAll('.similar-item').forEach(item => {
    item.addEventListener('click', () => {
      const c = state.companies.find(c => c.ticker === item.dataset.ticker);
      if (c) showDetail(c, companiesList);
    });
  });

  // Prev/Next
  el.detailPrev.onclick = () => {
    const idx = sorted.indexOf(company);
    if (idx > 0) showDetail(sorted[idx - 1], companiesList);
  };
  el.detailNext.onclick = () => {
    const idx = sorted.indexOf(company);
    if (idx < sorted.length - 1) showDetail(sorted[idx + 1], companiesList);
  };
}

function closeDetail() {
  el.detailPanel.classList.remove('open');
  setTimeout(() => {
    el.detailPanel.classList.add('hidden');
    el.detailOverlay.classList.add('hidden');
  }, 250);
}

el.detailClose.addEventListener('click', closeDetail);
el.detailOverlay.addEventListener('click', closeDetail);

// ==================== COMPARISON MODE ====================
el.compareBtn.addEventListener('click', () => {
  state.compareMode = !state.compareMode;
  el.compareBtn.classList.toggle('active', state.compareMode);
  el.selectorB.classList.toggle('hidden', !state.compareMode);
  el.comparisonPanel.classList.toggle('hidden', !state.compareMode);
  el.dashboard.classList.toggle('hidden', state.compareMode);
  if (state.compareMode && state.selectedIndustry && state.selectedIndustryB) renderComparison();
});

function renderComparison() {
  if (!state.selectedIndustry || !state.selectedIndustryB) return;

  const compA = getCompanies(state.selectedIndustry);
  const compB = getCompanies(state.selectedIndustryB);
  const sA = calcStats(compA);
  const sB = calcStats(compB);

  el.compareTitleA.textContent = state.selectedIndustry;
  el.compareTitleB.textContent = state.selectedIndustryB;

  // Stats comparison
  const metrics = [
    { label: 'Companies', a: sA.total, b: sB.total, fmt: fmt.num },
    { label: 'Total Market Cap', a: sA.totalCap, b: sB.totalCap, fmt: fmt.cap },
    { label: 'Avg Market Cap', a: sA.avgCap, b: sB.avgCap, fmt: fmt.cap },
    { label: 'Median Market Cap', a: sA.medianCap, b: sB.medianCap, fmt: fmt.cap },
    { label: 'Employees', a: sA.totalEmployees, b: sB.totalEmployees, fmt: fmt.num },
    { label: 'HHI Index', a: sA.hhi, b: sB.hhi, fmt: fmt.num },
    { label: 'States', a: sA.states, b: sB.states, fmt: fmt.num },
  ];

  el.compareStats.innerHTML = metrics.map(m => {
    const ratio = m.b > 0 ? (m.a / m.b).toFixed(1) : '—';
    const indicator = m.a > m.b ? 'higher' : m.a < m.b ? 'lower' : '';
    return `<div class="compare-stat">
      <span class="cs-label">${m.label}</span>
      <div class="cs-values">
        <span class="cs-a">${m.fmt(m.a)}</span>
        <span class="cs-indicator ${indicator}">${m.a > m.b ? '▲' : m.a < m.b ? '▼' : '='} ${ratio}x</span>
        <span class="cs-b">${m.fmt(m.b)}</span>
      </div>
    </div>`;
  }).join('');

  // Treemaps
  renderTreemap(compA, el.compareTreemapA);
  renderTreemap(compB, el.compareTreemapB);

  // Tables
  renderCompareTable(compA, el.compareTableA);
  renderCompareTable(compB, el.compareTableB);
}

function renderCompareTable(companies, container) {
  const sorted = [...companies].sort((a,b) => (b.marketCap||0)-(a.marketCap||0)).slice(0, 20);
  container.innerHTML = `<table>
    <thead><tr><th>#</th><th>Ticker</th><th>Name</th><th>Market Cap</th></tr></thead>
    <tbody>${sorted.map((c,i) => `<tr><td>${i+1}</td><td style="color:var(--accent2);font-weight:600">${escHtml(c.ticker)}</td><td>${escHtml(c.name)}</td><td>${fmt.cap(c.marketCap)}</td></tr>`).join('')}</tbody>
  </table>`;
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (e.key === '/') { e.preventDefault(); el.search.focus(); }
  if (e.key === 'Escape') closeDetail();
  if (e.key === 'c' || e.key === 'C') el.compareBtn.click();
  if (e.key === 'ArrowLeft' && state.selectedCompany) el.detailPrev.click();
  if (e.key === 'ArrowRight' && state.selectedCompany) el.detailNext.click();
});

// ==================== UTILITIES ====================
function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function exchangeName(ex) {
  const map = { XNYS:'NYSE', XNAS:'NASDAQ', XASE:'AMEX', BATS:'BATS', OTC:'OTC' };
  return map[ex] || ex || '—';
}

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ==================== WINDOW RESIZE ====================
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!state.compareMode) {
      renderTreemap(getCompanies(state.selectedIndustry), el.treemapCanvas);
      renderHistogram(getCompanies(state.selectedIndustry));
      renderIPO(getCompanies(state.selectedIndustry));
    }
  }, 200);
});

// ==================== INIT ====================
async function init() {
  try {
    const data = await loadData();
    buildIndices(data);
    el.loading.classList.add('hidden');
    el.main.classList.remove('hidden');

    // Build UI components
    buildMap();
    setupSelector(el.search, el.dropdown, el.allSection, el.recentSection, selectIndustry);
    setupSelector(el.searchB, el.dropdownB, null, null, selectIndustryB);
    setupTreemapInteraction(el.treemapCanvas, el.treemapTooltip);

    // Initial render with all data
    selectIndustry(null);
  } catch(e) {
    el.loading.classList.add('hidden');
    el.error.classList.remove('hidden');
    el.errorMsg.textContent = e.message;
  }
}

init();
})();
