// Eurostat Stats — Central Configuration
// All constants, defaults, and dataset metadata in one place.

const CONFIG = {
    api: {
        baseUrl: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/',
        format: 'JSON',
        lang: 'en',
    },

    cache: {
        ttlMs: 24 * 60 * 60 * 1000, // 24 hours
        prefix: 'eurostat_cache_',
    },

    ads: {
        client: 'ca-pub-6474686113446159',
        slot: '1234567890',
    },

    analytics: {
        id: 'G-599PBS1V4S',
    },

    colors: {
        palette: [
            '#0f766e', '#f97316', '#6366f1', '#ec4899',
            '#eab308', '#14b8a6', '#8b5cf6', '#ef4444',
            '#22c55e', '#3b82f6', '#a855f7', '#f43f5e',
        ],
        getColor(index) {
            return this.palette[index % this.palette.length];
        },
    },

    defaultGeo: ['DE', 'EL', 'FR', 'IT'],

    countryPresets: {
        'EU Big 4': ['DE', 'FR', 'IT', 'ES'],
        'Southern Europe': ['EL', 'IT', 'ES', 'PT'],
        'Nordic': ['DK', 'FI', 'SE', 'NO', 'IS'],
        'Eurozone Core': ['DE', 'FR', 'NL', 'BE', 'AT'],
        'Central Europe': ['PL', 'CZ', 'HU', 'SK'],
        'Baltic': ['EE', 'LV', 'LT'],
        'Benelux': ['BE', 'NL', 'LU'],
    },

    countries: {
        AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', CY: 'Cyprus',
        CZ: 'Czechia', DE: 'Germany', DK: 'Denmark', EE: 'Estonia',
        EL: 'Greece', ES: 'Spain', FI: 'Finland', FR: 'France',
        HR: 'Croatia', HU: 'Hungary', IE: 'Ireland', IT: 'Italy',
        LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', MT: 'Malta',
        NL: 'Netherlands', PL: 'Poland', PT: 'Portugal', RO: 'Romania',
        SE: 'Sweden', SI: 'Slovenia', SK: 'Slovakia',
        NO: 'Norway', IS: 'Iceland', CH: 'Switzerland',
        EU27_2020: 'EU-27', EA20: 'Euro Area',
    },

    // Navigation pages — drives the <nav> bar and dashboard routing
    pages: [
        { id: 'index',        label: 'Explorer',     href: 'index.html',               icon: 'search' },
        { id: 'economy',      label: 'Economy',      href: 'dashboard.html?page=economy',      icon: 'chart-line' },
        { id: 'tourism',      label: 'Tourism',      href: 'dashboard.html?page=tourism',      icon: 'plane' },
        { id: 'employment',   label: 'Employment',   href: 'dashboard.html?page=employment',   icon: 'briefcase' },
        { id: 'demographics', label: 'Demographics', href: 'dashboard.html?page=demographics', icon: 'users' },
        { id: 'environment',  label: 'Environment',  href: 'dashboard.html?page=environment',  icon: 'leaf' },
    ],

    // Chart type registry keys — supported by charts.js
    chartTypes: ['line', 'bar', 'stacked-area', 'grouped-bar'],

    // Page configs — embedded so dashboard.html works without fetching JSON
    // (fetch fails on file:// protocol due to CORS restrictions)
    pageConfigs: {
        economy: {
            id: 'economy',
            title: 'Eurostat Economy Statistics',
            subtitle: 'Visualize key European economic indicators and trends',
            metaDescription: 'Explore interactive charts and statistics about the European economy from Eurostat. Visualize economic indicators and trends for Europe.',
            metaKeywords: 'Eurostat, European economy, economic statistics, charts, data visualization, GDP, inflation, unemployment',
            charts: [
                { title: 'Government Accounts', description: 'Government revenue, expenditure, and balance for EU countries (millions of national currency).', dataset: 'gov_10a_main', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'MIO_NAC', sector: 'S13', na_item: 'TE' }, chartType: 'line' },
                { title: 'GDP Per Capita', description: 'GDP per capita in chain-linked volumes (2010 euros per inhabitant).', dataset: 'nama_10_pc', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'CLV10_EUR_HAB', na_item: 'B1GQ' }, chartType: 'line' },
                { title: 'Gross Domestic Product (GDP)', description: 'GDP at current prices in millions of euros.', dataset: 'nama_10_gdp', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'CP_MEUR', na_item: 'B1GQ' }, chartType: 'line' },
                { title: 'Unemployment Rate', description: 'Unemployment rate as a percentage of the active population (age 15-74).', dataset: 'une_rt_a', geo: ['DE', 'EL', 'FR', 'IT'], filters: { sex: 'T', age: 'Y15-74', unit: 'PC_ACT' }, chartType: 'line' },
                { title: 'Government Deficit / Surplus', description: 'Net lending or net borrowing of general government as a percentage of GDP.', dataset: 'gov_10dd_edpt1', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'PC_GDP', sector: 'S13', na_item: 'B9' }, chartType: 'bar' },
                { title: 'Inflation Rate (HICP Annual)', description: 'Annual average rate of change in the Harmonised Index of Consumer Prices.', dataset: 'tec00118', geo: ['DE', 'EL', 'FR', 'IT'], filters: {}, chartType: 'line' },
            ],
        },
        tourism: {
            id: 'tourism',
            title: 'Eurostat Tourism Statistics',
            subtitle: 'Explore European tourism trends and accommodation data',
            metaDescription: 'Discover interactive charts and statistics about European tourism from Eurostat. Visualize tourism trends and data for Europe.',
            metaKeywords: 'Eurostat, European tourism, tourism statistics, charts, data visualization, Europe, tourism',
            charts: [
                { title: 'Nights Spent at Tourist Accommodations', description: 'Total number of nights spent at hotels and similar establishments, by country.', dataset: 'tour_occ_ninat', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'NR', c_resid: 'TOTAL', nace_r2: 'I551' }, chartType: 'line' },
                { title: 'Accommodation Establishments', description: 'Number of accommodation establishments (hotels, holiday rentals, camping grounds) by country.', dataset: 'tour_cap_nat', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'NR', accomunit: 'ESTBL', nace_r2: 'I551-I553' }, chartType: 'line' },
                { title: 'Arrivals at Tourist Accommodations', description: 'Tourist arrivals at accommodation establishments, comparing countries over time.', dataset: 'tour_occ_anor', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'NR', c_resid: 'TOTAL', nace_r2: 'I551' }, chartType: 'line' },
                { title: 'Tourism Accommodation Capacity', description: 'Number of bed places available in tourist accommodations by country.', dataset: 'tour_cap_nat', geo: ['DE', 'EL', 'FR', 'IT', 'ES'], filters: { unit: 'NR', accomunit: 'BEDPL', nace_r2: 'I551-I553' }, chartType: 'bar' },
            ],
        },
        employment: {
            id: 'employment',
            title: 'Eurostat Employment Statistics',
            subtitle: 'Labour market indicators across the European Union',
            metaDescription: 'Explore European employment and labour market statistics from Eurostat. Visualize employment, unemployment, and earnings data interactively.',
            metaKeywords: 'Eurostat, employment, labour market, unemployment, earnings, jobs, Europe, statistics',
            charts: [
                { title: 'Employment (15-64)', description: 'Total employment of persons aged 15-64, in thousands.', dataset: 'lfsa_egan', geo: ['DE', 'EL', 'FR', 'IT'], filters: { sex: 'T', age: 'Y15-64', citizen: 'TOTAL', unit: 'THS_PER' }, chartType: 'line' },
                { title: 'Unemployment Rate', description: 'Unemployment rate as a percentage of the active population.', dataset: 'une_rt_a', geo: ['DE', 'EL', 'FR', 'IT', 'ES'], filters: { sex: 'T', age: 'Y15-74', unit: 'PC_ACT' }, chartType: 'line' },
                { title: 'Youth Unemployment Rate (15-24)', description: 'Unemployment rate for young people aged 15-24.', dataset: 'une_rt_a', geo: ['DE', 'EL', 'FR', 'IT', 'ES'], filters: { sex: 'T', age: 'Y15-24', unit: 'PC_ACT' }, chartType: 'line' },
                { title: 'Labour Cost Index', description: 'Index of hourly labour costs faced by employers (2016=100).', dataset: 'lci_r2_a', geo: ['DE', 'EL', 'FR', 'IT'], filters: { unit: 'I16', nace_r2: 'B-S', lcstruct: 'D1_D4_MD5' }, chartType: 'line' },
            ],
        },
        demographics: {
            id: 'demographics',
            title: 'Eurostat Demographics Statistics',
            subtitle: 'Population trends, life expectancy, and fertility across Europe',
            metaDescription: 'Explore European demographics data from Eurostat. Visualize population, life expectancy, and fertility trends interactively.',
            metaKeywords: 'Eurostat, demographics, population, life expectancy, fertility, Europe, statistics',
            charts: [
                { title: 'Population (1 January)', description: 'Total population on 1 January of each year.', dataset: 'demo_pjan', geo: ['DE', 'EL', 'FR', 'IT'], filters: { sex: 'T', age: 'TOTAL' }, chartType: 'line' },
                { title: 'Life Expectancy at Birth', description: 'Life expectancy at birth in years, both sexes.', dataset: 'demo_mlexpec', geo: ['DE', 'EL', 'FR', 'IT', 'ES', 'SE'], filters: { sex: 'T', age: 'Y_LT1' }, chartType: 'line' },
                { title: 'Total Fertility Rate', description: 'Mean number of children born per woman over her lifetime.', dataset: 'demo_find', geo: ['DE', 'EL', 'FR', 'IT', 'SE'], filters: { indic_de: 'TOTFERRT' }, chartType: 'line' },
                { title: 'Population Growth Rate', description: 'Crude rate of total population change (per 1,000 inhabitants).', dataset: 'demo_gind', geo: ['DE', 'EL', 'FR', 'IT', 'PL'], filters: { indic_de: 'GROWRT' }, chartType: 'bar' },
            ],
        },
        environment: {
            id: 'environment',
            title: 'Eurostat Environment Statistics',
            subtitle: 'Climate, energy, and environmental data for Europe',
            metaDescription: 'Explore European environment and climate statistics from Eurostat. Visualize greenhouse gas emissions, energy balance, and renewable energy data.',
            metaKeywords: 'Eurostat, environment, climate, greenhouse gas, emissions, energy, renewable, Europe, statistics',
            charts: [
                { title: 'Greenhouse Gas Emissions', description: 'Total greenhouse gas emissions in thousands of tonnes of CO2 equivalent (excluding LULUCF).', dataset: 'env_air_gge', geo: ['DE', 'EL', 'FR', 'IT'], filters: { airpol: 'GHG', src_crf: 'TOTX4_MEMO', unit: 'THS_T' }, chartType: 'line' },
                { title: 'Net GHG Emissions Index (1990=100)', description: 'Index of net greenhouse gas emissions relative to 1990, the EU SDG indicator.', dataset: 'sdg_13_10', geo: ['DE', 'EL', 'FR', 'IT', 'PL'], filters: {}, chartType: 'line' },
                { title: 'Renewable Energy Share', description: 'Share of renewable energy in gross final energy consumption (%).', dataset: 'nrg_ind_ren', geo: ['DE', 'EL', 'FR', 'IT', 'SE', 'DK'], filters: { nrg_bal: 'REN', unit: 'PC' }, chartType: 'line' },
                { title: 'Waste Generation', description: 'Total waste generated by all economic activities and households (in tonnes).', dataset: 'env_wasgen', geo: ['DE', 'FR', 'IT', 'ES'], filters: { waste: 'TOTAL', nace_r2: 'TOTAL_HH', unit: 'T', hazard: 'HAZ_NHAZ' }, chartType: 'bar' },
            ],
        },
    },
};

// Comprehensive dataset catalog — used by the Explorer search and dataset reference
const DATASETS = {
    // ── Tourism ──────────────────────────────────────────────
    tour_occ_ninat: {
        name: 'Nights Spent at Tourist Accommodations',
        category: 'Tourism',
        description: 'Total number of nights tourists spent in hotels, campsites, and other paid accommodations, broken down by country of the establishment and residence of the guest.',
        defaultFilters: { unit: 'NR', c_resid: 'TOTAL', nace_r2: 'I551' },
        dimensions: ['geo', 'time', 'unit', 'c_resid', 'nace_r2'],
        updateFrequency: 'Annual',
    },
    tour_occ_anor: {
        name: 'Arrivals at Tourist Accommodations',
        category: 'Tourism',
        description: 'Number of arrivals of residents and non-residents at tourist accommodation establishments by country.',
        defaultFilters: { unit: 'NR', c_resid: 'TOTAL', nace_r2: 'I551' },
        dimensions: ['geo', 'time', 'unit', 'c_resid', 'nace_r2'],
        updateFrequency: 'Annual',
    },
    tour_occ_arm: {
        name: 'Tourism Accommodation Rooms',
        category: 'Tourism',
        description: 'Number of rooms available in tourist accommodation establishments by type and country.',
        defaultFilters: { unit: 'NR', nace_r2: 'I551' },
        dimensions: ['geo', 'time', 'unit', 'nace_r2'],
        updateFrequency: 'Annual',
    },
    tour_cap_nat: {
        name: 'Tourism Accommodation Capacity',
        category: 'Tourism',
        description: 'Number of bed places and establishments in tourist accommodations by type and country.',
        defaultFilters: { unit: 'NR', accomunit: 'ESTBL', nace_r2: 'I551-I553' },
        dimensions: ['geo', 'time', 'unit', 'accomunit', 'nace_r2'],
        updateFrequency: 'Annual',
    },
    tour_occ_tour: {
        name: 'Tourism Trips by Purpose',
        category: 'Tourism',
        description: 'Tourism trips by destination country, purpose (holiday, business), and country of residence.',
        defaultFilters: { unit: 'NR', purpose: 'HOLIDAY', c_resid: 'TOTAL' },
        dimensions: ['geo', 'time', 'unit', 'purpose', 'c_resid'],
        updateFrequency: 'Annual',
    },
    tour_dem_tttot: {
        name: 'Tourism Demand: Total Trips',
        category: 'Tourism',
        description: 'Total tourism trips made by residents of a country, to domestic and foreign destinations.',
        defaultFilters: { unit: 'NR', c_resid: 'TOTAL' },
        dimensions: ['geo', 'time', 'unit', 'c_resid'],
        updateFrequency: 'Annual',
    },

    // ── Economy ──────────────────────────────────────────────
    nama_10_gdp: {
        name: 'GDP and Main Components',
        category: 'Economy',
        description: 'Gross Domestic Product at current prices, covering output, expenditure, and income approaches.',
        defaultFilters: { unit: 'CP_MEUR', na_item: 'B1GQ' },
        dimensions: ['geo', 'time', 'unit', 'na_item'],
        updateFrequency: 'Annual',
    },
    nama_10_pc: {
        name: 'GDP Per Capita',
        category: 'Economy',
        description: 'GDP per capita in chain-linked volumes (2010 euros per inhabitant), useful for cross-country standard-of-living comparisons.',
        defaultFilters: { unit: 'CLV10_EUR_HAB', na_item: 'B1GQ' },
        dimensions: ['geo', 'time', 'unit', 'na_item'],
        updateFrequency: 'Annual',
    },
    gov_10a_main: {
        name: 'Government Accounts',
        category: 'Economy',
        description: 'General government revenue, expenditure, and net lending/borrowing in millions of national currency.',
        defaultFilters: { unit: 'MIO_NAC', sector: 'S13', na_item: 'TE' },
        dimensions: ['geo', 'time', 'unit', 'sector', 'na_item'],
        updateFrequency: 'Annual',
    },
    prc_ppp_ind: {
        name: 'Price Level Indices',
        category: 'Economy',
        description: 'GDP per capita, consumption per capita, and comparative price level indices in PPS.',
        defaultFilters: { na_item: 'PLI_EU27_2020' },
        dimensions: ['geo', 'time', 'na_item'],
        updateFrequency: 'Annual',
    },
    tec00114: {
        name: 'GDP Per Capita in PPS',
        category: 'Economy',
        description: 'GDP per capita in Purchasing Power Standards (EU27=100), showing relative economic output.',
        defaultFilters: {},
        dimensions: ['geo', 'time'],
        updateFrequency: 'Annual',
    },
    nama_10_a10: {
        name: 'Gross Value Added by Industry',
        category: 'Economy',
        description: 'Gross value added broken down by A*10 industry classification (agriculture, industry, services, etc.).',
        defaultFilters: { unit: 'CP_MEUR', nace_r2: 'TOTAL' },
        dimensions: ['geo', 'time', 'unit', 'nace_r2'],
        updateFrequency: 'Annual',
    },
    prc_hicp_midx: {
        name: 'Consumer Prices (HICP Monthly)',
        category: 'Economy',
        description: 'Harmonised Index of Consumer Prices — monthly index for tracking inflation across EU member states.',
        defaultFilters: { coicop: 'CP00', unit: 'I15' },
        dimensions: ['geo', 'time', 'coicop', 'unit'],
        updateFrequency: 'Monthly',
    },
    prc_hicp_aind: {
        name: 'Consumer Prices (HICP Annual)',
        category: 'Economy',
        description: 'HICP annual average index — the standard measure for comparing inflation rates across the EU.',
        defaultFilters: { coicop: 'CP00', unit: 'INX_A_AVG' },
        dimensions: ['geo', 'time', 'coicop', 'unit'],
        updateFrequency: 'Annual',
    },
    une_rt_a: {
        name: 'Unemployment Rate',
        category: 'Economy',
        description: 'Unemployment rate by sex and age group as a percentage of the active population.',
        defaultFilters: { sex: 'T', age: 'Y15-74', unit: 'PC_ACT' },
        dimensions: ['geo', 'time', 'sex', 'age', 'unit'],
        updateFrequency: 'Annual',
    },
    gov_10dd_edpt1: {
        name: 'Government Deficit and Debt',
        category: 'Economy',
        description: 'Government finance statistics including deficit/surplus and debt levels as percentage of GDP.',
        defaultFilters: { unit: 'PC_GDP', sector: 'S13', na_item: 'B9' },
        dimensions: ['geo', 'time', 'unit', 'sector', 'na_item'],
        updateFrequency: 'Annual',
    },
    lci_r2_a: {
        name: 'Labour Cost Index',
        category: 'Economy',
        description: 'Labour cost index measuring changes in hourly labour costs faced by employers.',
        defaultFilters: { unit: 'I16', nace_r2: 'B-S', lcstruct: 'D1_D4_MD5' },
        dimensions: ['geo', 'time', 'unit', 'nace_r2', 'lcstruct'],
        updateFrequency: 'Quarterly',
    },
    tec00118: {
        name: 'Inflation Rate (Annual Change)',
        category: 'Economy',
        description: 'Annual rate of change in the HICP — the headline inflation figure used by the ECB.',
        defaultFilters: {},
        dimensions: ['geo', 'time'],
        updateFrequency: 'Annual',
    },
    tec00001: {
        name: 'GDP Per Capita in Euro',
        category: 'Economy',
        description: 'GDP per capita expressed in current euros.',
        defaultFilters: {},
        dimensions: ['geo', 'time'],
        updateFrequency: 'Annual',
    },

    // ── Employment ───────────────────────────────────────────
    lfsa_egan: {
        name: 'Employment by Age, Sex and Nationality',
        category: 'Employment',
        description: 'Employment levels broken down by age group, sex, and citizenship, in thousands of persons.',
        defaultFilters: { sex: 'T', age: 'Y15-64', citizen: 'TOTAL', unit: 'THS_PER' },
        dimensions: ['geo', 'time', 'sex', 'age', 'citizen', 'unit'],
        updateFrequency: 'Annual',
    },
    lfsa_urgan: {
        name: 'Unemployment by Age, Sex and Nationality',
        category: 'Employment',
        description: 'Unemployment levels by age group, sex, and citizenship.',
        defaultFilters: { sex: 'T', age: 'Y15-74', citizen: 'TOTAL', unit: 'THS_PER' },
        dimensions: ['geo', 'time', 'sex', 'age', 'citizen', 'unit'],
        updateFrequency: 'Annual',
    },
    earn_ses_annual: {
        name: 'Annual Earnings',
        category: 'Employment',
        description: 'Mean and median annual earnings of employees by sex, economic activity, and education.',
        defaultFilters: { unit: 'EUR', sex: 'T', age: 'TOTAL', isco08: 'TOTAL' },
        dimensions: ['geo', 'time', 'unit', 'sex', 'age', 'isco08'],
        updateFrequency: 'Annual (4-year cycle)',
    },
    lfsa_epgan: {
        name: 'Part-Time Employment',
        category: 'Employment',
        description: 'Part-time employment as a percentage of total employment, by sex and age.',
        defaultFilters: { sex: 'T', age: 'Y15-64', unit: 'PC_EMP', wstatus: 'EMP' },
        dimensions: ['geo', 'time', 'sex', 'age', 'unit', 'wstatus'],
        updateFrequency: 'Annual',
    },

    // ── Demographics ─────────────────────────────────────────
    demo_pjan: {
        name: 'Population on 1 January',
        category: 'Demographics',
        description: 'Total population on 1 January of each year, the standard benchmark for population size.',
        defaultFilters: { sex: 'T', age: 'TOTAL' },
        dimensions: ['geo', 'time', 'sex', 'age'],
        updateFrequency: 'Annual',
    },
    demo_mlexpec: {
        name: 'Life Expectancy',
        category: 'Demographics',
        description: 'Life expectancy at birth and at given ages, by sex.',
        defaultFilters: { sex: 'T', age: 'Y_LT1' },
        dimensions: ['geo', 'time', 'sex', 'age'],
        updateFrequency: 'Annual',
    },
    demo_find: {
        name: 'Fertility Indicators',
        category: 'Demographics',
        description: 'Total fertility rate, mean age of mothers at childbirth, and other fertility indicators.',
        defaultFilters: { indic_de: 'TOTFERRT' },
        dimensions: ['geo', 'time', 'indic_de'],
        updateFrequency: 'Annual',
    },
    demo_gind: {
        name: 'Population Change',
        category: 'Demographics',
        description: 'Crude rates of population change — births, deaths, natural change, net migration.',
        defaultFilters: { indic_de: 'GROWRT' },
        dimensions: ['geo', 'time', 'indic_de'],
        updateFrequency: 'Annual',
    },

    // ── Environment ──────────────────────────────────────────
    env_air_gge: {
        name: 'Greenhouse Gas Emissions',
        category: 'Environment',
        description: 'Greenhouse gas emissions (CO2, CH4, N2O, etc.) by source sector, in thousands of tonnes of CO2 equivalent.',
        defaultFilters: { airpol: 'GHG', src_crf: 'TOTX4_MEMO', unit: 'THS_T' },
        dimensions: ['geo', 'time', 'airpol', 'src_crf', 'unit'],
        updateFrequency: 'Annual',
    },
    nrg_bal_c: {
        name: 'Energy Balance',
        category: 'Environment',
        description: 'Complete energy balance sheets — production, imports, consumption by fuel type.',
        defaultFilters: { siec: 'TOTAL', nrg_bal: 'FC_IND_E', unit: 'KTOE' },
        dimensions: ['geo', 'time', 'siec', 'nrg_bal', 'unit'],
        updateFrequency: 'Annual',
    },
    env_wasgen: {
        name: 'Waste Generation',
        category: 'Environment',
        description: 'Generation of waste by economic activity and waste category, in tonnes.',
        defaultFilters: { waste: 'TOTAL', nace_r2: 'TOTAL_HH', unit: 'T', hazard: 'HAZ_NHAZ' },
        dimensions: ['geo', 'time', 'waste', 'nace_r2', 'unit', 'hazard'],
        updateFrequency: 'Biennial',
    },
    sdg_13_10: {
        name: 'Net Greenhouse Gas Emissions',
        category: 'Environment',
        description: 'Net GHG emissions index (1990=100) — the SDG indicator tracking climate commitments.',
        defaultFilters: {},
        dimensions: ['geo', 'time'],
        updateFrequency: 'Annual',
    },
    nrg_ind_ren: {
        name: 'Renewable Energy Share',
        category: 'Environment',
        description: 'Share of renewable energy in gross final energy consumption, as a percentage.',
        defaultFilters: { nrg_bal: 'REN', unit: 'PC' },
        dimensions: ['geo', 'time', 'nrg_bal', 'unit'],
        updateFrequency: 'Annual',
    },
};

// Helper: build a full Eurostat API URL from a dataset code, geo list, and optional filters
function buildEurostatUrl(datasetCode, geoList, extraFilters) {
    const base = CONFIG.api.baseUrl + datasetCode;
    const params = new URLSearchParams();
    params.set('format', CONFIG.api.format);
    params.set('lang', CONFIG.api.lang);
    (geoList || CONFIG.defaultGeo).forEach(g => params.append('geo', g));

    const meta = DATASETS[datasetCode];
    const defaults = meta ? meta.defaultFilters : {};
    const merged = Object.assign({}, defaults, extraFilters || {});
    for (const [k, v] of Object.entries(merged)) {
        params.set(k, v);
    }
    return base + '?' + params.toString();
}

// Helper: get datasets grouped by category
function getDatasetsByCategory() {
    const groups = {};
    for (const [code, meta] of Object.entries(DATASETS)) {
        const cat = meta.category;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push({ code, ...meta });
    }
    return groups;
}

// Helper: search datasets by keyword (name, description, or code)
function searchDatasets(query) {
    const q = query.toLowerCase().trim();
    if (!q) return Object.entries(DATASETS).map(([code, meta]) => ({ code, ...meta }));
    return Object.entries(DATASETS)
        .filter(([code, meta]) =>
            code.toLowerCase().includes(q) ||
            meta.name.toLowerCase().includes(q) ||
            meta.description.toLowerCase().includes(q) ||
            meta.category.toLowerCase().includes(q)
        )
        .map(([code, meta]) => ({ code, ...meta }));
}
