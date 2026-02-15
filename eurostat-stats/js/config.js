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

    unitLabels: {
        CLV10_EUR_HAB: 'Euros per inhabitant (2010 chain-linked)',
        CP_MEUR: 'Millions of EUR',
        MIO_NAC: 'Millions of national currency',
        PC_ACT: '% of active population',
        PC_GDP: '% of GDP',
        PC: '%',
        THS_PER: 'Thousands of persons',
        NR: 'Count',
        I15: 'Index (2015=100)',
        I16: 'Index (2016=100)',
        INX_A_AVG: 'Index (annual average)',
        THS_T: 'Thousand tonnes',
        T: 'Tonnes',
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
        { id: 'index',          label: 'Explorer',     href: 'index.html',                       icon: 'search' },
        { id: 'economy',        label: 'Economy',      href: 'dashboard.html?page=economy',      icon: 'chart-line' },
        { id: 'tourism',        label: 'Tourism',      href: 'dashboard.html?page=tourism',      icon: 'plane' },
        { id: 'employment',     label: 'Employment',   href: 'dashboard.html?page=employment',   icon: 'briefcase' },
        { id: 'demographics',   label: 'Demographics', href: 'dashboard.html?page=demographics', icon: 'users' },
        { id: 'environment',    label: 'Environment',  href: 'dashboard.html?page=environment',  icon: 'leaf' },
        { id: 'superpowers',    label: 'Superpowers',  href: 'superpowers.html',                 icon: 'star' },
        { id: 'perception-quiz',label: 'Rich or Poor?',href: 'perception-quiz.html',            icon: 'question' },
        { id: 'move-quiz',      label: 'Move Quiz',    href: 'move-quiz.html',                   icon: 'compass' },
    ],

    // Chart type registry keys — supported by charts.js
    chartTypes: ['line', 'bar', 'stacked-area', 'grouped-bar'],

    timelineEvents: [
        { year: '2008', label: 'Financial Crisis', major: true },
        { year: '2010', label: 'Euro Debt Crisis', major: true },
        { year: '2015', label: 'Migration Crisis', major: false },
        { year: '2020', label: 'COVID-19', major: true },
        { year: '2022', label: 'Energy Crisis', major: true },
    ],

    eventOverlayPacks: {
        macro: {
            label: 'Macro shocks',
            events: [
                { year: '2008', label: 'Financial Crisis', major: true },
                { year: '2010', label: 'Euro Debt Crisis', major: true },
                { year: '2015', label: 'Migration Crisis', major: false },
                { year: '2020', label: 'COVID-19', major: true },
                { year: '2022', label: 'Energy Crisis', major: true },
            ],
        },
        policy: {
            label: 'EU policy milestones',
            events: [
                { year: '2002', label: 'Euro Cash Changeover', major: true },
                { year: '2007', label: 'EU Enlargement (BG/RO)', major: false },
                { year: '2019', label: 'European Green Deal', major: true },
                { year: '2021', label: 'Recovery and Resilience Facility', major: true },
            ],
        },
        country: {
            label: 'Country markers',
            events: [
                { year: '2001', label: 'Greece joins euro', geo: 'EL', major: true },
                { year: '2007', label: 'Cyprus joins euro', geo: 'CY', major: false },
                { year: '2007', label: 'Malta joins euro', geo: 'MT', major: false },
                { year: '2009', label: 'Slovakia joins euro', geo: 'SK', major: false },
                { year: '2011', label: 'Estonia joins euro', geo: 'EE', major: false },
                { year: '2014', label: 'Latvia joins euro', geo: 'LV', major: false },
                { year: '2015', label: 'Lithuania joins euro', geo: 'LT', major: false },
                { year: '2023', label: 'Croatia joins euro', geo: 'HR', major: true },
            ],
        },
    },

    signalFeed: {
        yoyThresholdPct: 2,
        maxItems: 5,
    },

    myDashboard: {
        storageKey: 'eurostat_my_dashboard_v1',
    },

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

// ── Move Quiz Configuration ─────────────────────────────────
CONFIG.moveQuiz = {
    questions: [
        {
            id: 'weather',
            label: 'Weather preference',
            description: 'Do you prefer warm Mediterranean climate or cooler northern weather?',
            type: 'slider',
            minLabel: 'Cool & rainy',
            maxLabel: 'Warm & sunny',
            weight: 0.2
        },
        {
            id: 'cost',
            label: 'Cost of living',
            description: 'How important is a low cost of living to you?',
            type: 'slider',
            minLabel: 'Money is no object',
            maxLabel: 'Budget is key',
            weight: 0.25
        },
        {
            id: 'career',
            label: 'Career vs lifestyle',
            description: 'What matters more — career opportunities or work-life balance?',
            type: 'slider',
            minLabel: 'Career growth',
            maxLabel: 'Work-life balance',
            weight: 0.2
        },
        {
            id: 'urban',
            label: 'City vs nature',
            description: 'Do you prefer urban life or access to nature?',
            type: 'slider',
            minLabel: 'Big city energy',
            maxLabel: 'Nature & space',
            weight: 0.15
        },
        {
            id: 'english',
            label: 'English friendliness',
            description: 'How important is it that locals speak English?',
            type: 'slider',
            minLabel: 'I\'ll learn the language',
            maxLabel: 'English is essential',
            weight: 0.2
        }
    ],

    // Country scores for each dimension (0-100, higher = more of that trait)
    // These are derived from Eurostat data + reasonable estimates
    countryScores: {
        AT: { weather: 35, cost: 30, career: 55, urban: 50, english: 60, name: 'Austria', flag: '\u{1F1E6}\u{1F1F9}' },
        BE: { weather: 30, cost: 35, career: 65, urban: 75, english: 70, name: 'Belgium', flag: '\u{1F1E7}\u{1F1EA}' },
        BG: { weather: 55, cost: 90, career: 30, urban: 40, english: 35, name: 'Bulgaria', flag: '\u{1F1E7}\u{1F1EC}' },
        HR: { weather: 70, cost: 75, career: 35, urban: 35, english: 50, name: 'Croatia', flag: '\u{1F1ED}\u{1F1F7}' },
        CY: { weather: 95, cost: 50, career: 40, urban: 45, english: 85, name: 'Cyprus', flag: '\u{1F1E8}\u{1F1FE}' },
        CZ: { weather: 30, cost: 65, career: 50, urban: 55, english: 45, name: 'Czechia', flag: '\u{1F1E8}\u{1F1FF}' },
        DK: { weather: 20, cost: 20, career: 60, urban: 60, english: 90, name: 'Denmark', flag: '\u{1F1E9}\u{1F1F0}' },
        EE: { weather: 15, cost: 55, career: 55, urban: 40, english: 75, name: 'Estonia', flag: '\u{1F1EA}\u{1F1EA}' },
        FI: { weather: 10, cost: 35, career: 55, urban: 35, english: 85, name: 'Finland', flag: '\u{1F1EB}\u{1F1EE}' },
        FR: { weather: 55, cost: 40, career: 60, urban: 65, english: 40, name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
        DE: { weather: 30, cost: 45, career: 75, urban: 70, english: 65, name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
        EL: { weather: 90, cost: 60, career: 25, urban: 45, english: 55, name: 'Greece', flag: '\u{1F1EC}\u{1F1F7}' },
        HU: { weather: 45, cost: 80, career: 40, urban: 50, english: 40, name: 'Hungary', flag: '\u{1F1ED}\u{1F1FA}' },
        IE: { weather: 25, cost: 25, career: 70, urban: 55, english: 100, name: 'Ireland', flag: '\u{1F1EE}\u{1F1EA}' },
        IT: { weather: 75, cost: 50, career: 45, urban: 60, english: 35, name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}' },
        LV: { weather: 20, cost: 65, career: 40, urban: 45, english: 55, name: 'Latvia', flag: '\u{1F1F1}\u{1F1FB}' },
        LT: { weather: 20, cost: 70, career: 45, urban: 45, english: 50, name: 'Lithuania', flag: '\u{1F1F1}\u{1F1F9}' },
        LU: { weather: 30, cost: 15, career: 70, urban: 70, english: 75, name: 'Luxembourg', flag: '\u{1F1F1}\u{1F1FA}' },
        MT: { weather: 95, cost: 55, career: 45, urban: 85, english: 95, name: 'Malta', flag: '\u{1F1F2}\u{1F1F9}' },
        NL: { weather: 25, cost: 30, career: 70, urban: 80, english: 95, name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}' },
        PL: { weather: 30, cost: 75, career: 50, urban: 55, english: 45, name: 'Poland', flag: '\u{1F1F5}\u{1F1F1}' },
        PT: { weather: 85, cost: 65, career: 35, urban: 50, english: 55, name: 'Portugal', flag: '\u{1F1F5}\u{1F1F9}' },
        RO: { weather: 50, cost: 85, career: 35, urban: 40, english: 40, name: 'Romania', flag: '\u{1F1F7}\u{1F1F4}' },
        SK: { weather: 35, cost: 70, career: 45, urban: 45, english: 45, name: 'Slovakia', flag: '\u{1F1F8}\u{1F1F0}' },
        SI: { weather: 50, cost: 55, career: 45, urban: 40, english: 60, name: 'Slovenia', flag: '\u{1F1F8}\u{1F1EE}' },
        ES: { weather: 85, cost: 55, career: 40, urban: 65, english: 40, name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}' },
        SE: { weather: 15, cost: 30, career: 60, urban: 50, english: 90, name: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}' }
    }
};

// ── Country Superpowers ─────────────────────────────────────
CONFIG.superpowers = {
    AT: {
        name: 'Austria',
        flag: '\u{1F1E6}\u{1F1F9}',
        superpower: 'Highest Quality of Life Index',
        metric: 'Quality of Life',
        value: '8.4/10',
        source: 'EuroFound 2023',
        funFact: 'Vienna has been ranked the most liveable city in the world 3 years running'
    },
    BE: {
        name: 'Belgium',
        flag: '\u{1F1E7}\u{1F1EA}',
        superpower: 'Most Productive Workers',
        metric: 'GDP per hour worked',
        value: '€68.50',
        source: 'Eurostat 2023',
        funFact: 'Belgian workers produce more value per hour than any other EU nation'
    },
    BG: {
        name: 'Bulgaria',
        flag: '\u{1F1E7}\u{1F1EC}',
        superpower: 'Lowest Cost of Living',
        metric: 'Price Level Index',
        value: '47 (EU=100)',
        source: 'Eurostat 2023',
        funFact: 'Your euro goes twice as far in Sofia as in Paris'
    },
    HR: {
        name: 'Croatia',
        flag: '\u{1F1ED}\u{1F1F7}',
        superpower: 'Most Coastline per Capita',
        metric: 'Adriatic coastline',
        value: '1,777 km',
        source: 'Geographic data',
        funFact: '1,244 islands dot the Croatian coast'
    },
    CY: {
        name: 'Cyprus',
        flag: '\u{1F1E8}\u{1F1FE}',
        superpower: 'Sunniest Country',
        metric: 'Annual sunshine hours',
        value: '3,400 hours',
        source: 'Climate data',
        funFact: 'More sunshine than any EU member state'
    },
    CZ: {
        name: 'Czechia',
        flag: '\u{1F1E8}\u{1F1FF}',
        superpower: 'Lowest Unemployment',
        metric: 'Unemployment rate',
        value: '2.6%',
        source: 'Eurostat 2024',
        funFact: 'Virtually everyone who wants a job has one'
    },
    DK: {
        name: 'Denmark',
        flag: '\u{1F1E9}\u{1F1F0}',
        superpower: 'Happiest People',
        metric: 'Happiness Index',
        value: '7.6/10',
        source: 'World Happiness Report 2024',
        funFact: 'Danes invented hygge — cozy contentment as a lifestyle'
    },
    EE: {
        name: 'Estonia',
        flag: '\u{1F1EA}\u{1F1EA}',
        superpower: 'Most Digital Government',
        metric: 'Digital public services',
        value: '99% online',
        source: 'EU Digital Index 2023',
        funFact: 'Estonians can vote, pay taxes, and start a company from their phone'
    },
    FI: {
        name: 'Finland',
        flag: '\u{1F1EB}\u{1F1EE}',
        superpower: 'Best Education System',
        metric: 'PISA scores',
        value: 'Top 5 globally',
        source: 'OECD PISA 2022',
        funFact: 'Finnish kids have the shortest school days and least homework in Europe'
    },
    FR: {
        name: 'France',
        flag: '\u{1F1EB}\u{1F1F7}',
        superpower: 'Most Visited Country',
        metric: 'International tourists',
        value: '89M/year',
        source: 'UNWTO 2023',
        funFact: 'More people visit France than any other country on Earth'
    },
    DE: {
        name: 'Germany',
        flag: '\u{1F1E9}\u{1F1EA}',
        superpower: 'Largest Economy',
        metric: 'GDP',
        value: '€4.1 trillion',
        source: 'Eurostat 2023',
        funFact: 'Germany alone produces 25% of the EU\'s economic output'
    },
    EL: {
        name: 'Greece',
        flag: '\u{1F1EC}\u{1F1F7}',
        superpower: 'Most Islands',
        metric: 'Number of islands',
        value: '6,000+',
        source: 'Geographic data',
        funFact: 'Only 227 of Greece\'s islands are inhabited'
    },
    HU: {
        name: 'Hungary',
        flag: '\u{1F1ED}\u{1F1FA}',
        superpower: 'Most Thermal Springs',
        metric: 'Thermal baths',
        value: '1,500+',
        source: 'Tourism data',
        funFact: 'Budapest has more thermal baths than any other capital city'
    },
    IE: {
        name: 'Ireland',
        flag: '\u{1F1EE}\u{1F1EA}',
        superpower: 'Highest GDP per Capita',
        metric: 'GDP per capita',
        value: '€103,000',
        source: 'Eurostat 2023',
        funFact: 'Ireland\'s GDP per person exceeds Switzerland and the USA'
    },
    IT: {
        name: 'Italy',
        flag: '\u{1F1EE}\u{1F1F9}',
        superpower: 'Most UNESCO Sites',
        metric: 'World Heritage Sites',
        value: '59 sites',
        source: 'UNESCO 2024',
        funFact: 'More cultural heritage sites than any country on Earth'
    },
    LV: {
        name: 'Latvia',
        flag: '\u{1F1F1}\u{1F1FB}',
        superpower: 'Fastest Internet',
        metric: 'Average broadband speed',
        value: '90 Mbps',
        source: 'Speedtest Global Index',
        funFact: 'Riga has some of the fastest fiber connections in the world'
    },
    LT: {
        name: 'Lithuania',
        flag: '\u{1F1F1}\u{1F1F9}',
        superpower: 'Most Fintech Licenses',
        metric: 'EU fintech licenses',
        value: '140+',
        source: 'Bank of Lithuania 2024',
        funFact: 'Lithuania has become Europe\'s fintech capital'
    },
    LU: {
        name: 'Luxembourg',
        flag: '\u{1F1F1}\u{1F1FA}',
        superpower: 'Highest Wages',
        metric: 'Average annual salary',
        value: '€72,000',
        source: 'Eurostat 2023',
        funFact: 'Luxembourg\'s minimum wage exceeds most countries\' averages'
    },
    MT: {
        name: 'Malta',
        flag: '\u{1F1F2}\u{1F1F9}',
        superpower: 'Most English Speakers',
        metric: 'English proficiency',
        value: '95%',
        source: 'Eurobarometer',
        funFact: 'English is an official language — the only EU country besides Ireland'
    },
    NL: {
        name: 'Netherlands',
        flag: '\u{1F1F3}\u{1F1F1}',
        superpower: 'Best Work-Life Balance',
        metric: 'Part-time employment',
        value: '50%',
        source: 'Eurostat 2023',
        funFact: 'Half of Dutch workers choose part-time — and they\'re the happiest about it'
    },
    PL: {
        name: 'Poland',
        flag: '\u{1F1F5}\u{1F1F1}',
        superpower: 'Fastest Growing Economy',
        metric: '20-year GDP growth',
        value: '+147%',
        source: 'Eurostat 2004-2024',
        funFact: 'Poland is the only EU country to avoid recession during the 2008 crisis'
    },
    PT: {
        name: 'Portugal',
        flag: '\u{1F1F5}\u{1F1F9}',
        superpower: 'Best Renewable Energy Growth',
        metric: 'Renewable share increase',
        value: '+35% since 2010',
        source: 'Eurostat Energy',
        funFact: 'Portugal ran on 100% renewables for 6 days straight in 2024'
    },
    RO: {
        name: 'Romania',
        flag: '\u{1F1F7}\u{1F1F4}',
        superpower: 'Fastest Mobile Internet',
        metric: '5G download speed',
        value: '220 Mbps',
        source: 'Opensignal 2024',
        funFact: 'Bucharest has faster mobile internet than New York or London'
    },
    SK: {
        name: 'Slovakia',
        flag: '\u{1F1F8}\u{1F1F0}',
        superpower: 'Most Cars Produced per Capita',
        metric: 'Car production per capita',
        value: '202 cars/1000 people',
        source: 'ACEA 2023',
        funFact: 'Slovakia builds more cars per person than any country on Earth'
    },
    SI: {
        name: 'Slovenia',
        flag: '\u{1F1F8}\u{1F1EE}',
        superpower: 'Most Forested Country',
        metric: 'Forest coverage',
        value: '58%',
        source: 'Eurostat Environment',
        funFact: 'More than half of Slovenia is covered in forest'
    },
    ES: {
        name: 'Spain',
        flag: '\u{1F1EA}\u{1F1F8}',
        superpower: 'Longest Life Expectancy',
        metric: 'Life expectancy',
        value: '84 years',
        source: 'Eurostat 2023',
        funFact: 'Spaniards live longer than any other EU citizens'
    },
    SE: {
        name: 'Sweden',
        flag: '\u{1F1F8}\u{1F1EA}',
        superpower: 'Most Innovative Economy',
        metric: 'Innovation Index',
        value: '#1 in EU',
        source: 'EU Innovation Scoreboard 2024',
        funFact: 'Sweden has produced more billion-dollar startups per capita than anywhere except Silicon Valley'
    }
};

// ── Perception Quiz Configuration ────────────────────────────
CONFIG.perceptionQuiz = {
    questions: [
        {
            id: 'q1',
            stats: {
                'GDP per capita': '€35,000',
                'Unemployment': '11.5%',
                'Government debt': '140% of GDP'
            },
            answer: 'IT',
            options: ['IT', 'ES', 'EL', 'PT'],
            explanation: 'Italy has high GDP per capita but also high unemployment and massive debt — a complex economy that defies simple rich/poor labels.'
        },
        {
            id: 'q2',
            stats: {
                'GDP per capita': '€12,000',
                'Unemployment': '2.8%',
                'GDP growth (5yr)': '+28%'
            },
            answer: 'PL',
            options: ['PL', 'RO', 'BG', 'HU'],
            explanation: 'Poland has lower wages than Western Europe but near-full employment and explosive growth. It\'s the EU\'s biggest success story.'
        },
        {
            id: 'q3',
            stats: {
                'GDP per capita': '€103,000',
                'Population': '5.1 million',
                'Corporate tax haven': 'Yes'
            },
            answer: 'IE',
            options: ['LU', 'IE', 'NL', 'DK'],
            explanation: 'Ireland\'s GDP is inflated by multinationals routing profits through Dublin, but the wealth effect is real — tech workers earn Silicon Valley salaries.'
        },
        {
            id: 'q4',
            stats: {
                'Unemployment': '12.1%',
                'Youth unemployment': '26%',
                'Life expectancy': '84.3 years (EU\'s highest)'
            },
            answer: 'ES',
            options: ['ES', 'IT', 'EL', 'PT'],
            explanation: 'Spain has chronic unemployment but also Europe\'s longest life expectancy. Quality of life isn\'t just about jobs.'
        },
        {
            id: 'q5',
            stats: {
                'GDP per capita': '€48,000',
                'Happiness rank': '#2 in world',
                'Personal tax rate': 'Up to 55%'
            },
            answer: 'DK',
            options: ['DK', 'SE', 'FI', 'NL'],
            explanation: 'Denmark: extremely high taxes, extremely happy people. The "expensive = worse" assumption doesn\'t hold.'
        },
        {
            id: 'q6',
            stats: {
                'GDP per capita': '€50,000',
                'Average working hours': '1,349/year (lowest in EU)',
                'Part-time rate': '50%'
            },
            answer: 'NL',
            options: ['NL', 'DE', 'BE', 'AT'],
            explanation: 'The Dutch work the fewest hours in Europe yet remain one of the richest. Efficiency over hustle.'
        },
        {
            id: 'q7',
            stats: {
                'GDP per capita': '€18,000',
                'Digital government': 'World\'s most advanced',
                'Tech startups per capita': 'Higher than Germany'
            },
            answer: 'EE',
            options: ['EE', 'FI', 'LT', 'LV'],
            explanation: 'Estonia: former Soviet state, now digital pioneer. They skipped the 20th century and built the future.'
        },
        {
            id: 'q8',
            stats: {
                'GDP per capita': '€17,500',
                'Unemployment': '27.3% (2013)',
                'Tourism revenue': '€20 billion/year'
            },
            answer: 'EL',
            options: ['EL', 'PT', 'HR', 'CY'],
            explanation: 'Greece went from near-collapse to tourism boom. The 2013 unemployment figure shows how far they\'ve come.'
        },
        {
            id: 'q9',
            stats: {
                'GDP per capita': '€128,000',
                'Population': '660,000',
                'Banking sector': '22x GDP'
            },
            answer: 'LU',
            options: ['LU', 'IE', 'MT', 'CY'],
            explanation: 'Luxembourg is absurdly rich on paper, but half the workforce commutes from neighboring countries. The wealth is real but concentrated.'
        },
        {
            id: 'q10',
            stats: {
                'GDP per capita': '€9,500',
                'IT sector growth': '+300% (10yr)',
                'Emigration': '100,000/year'
            },
            answer: 'RO',
            options: ['RO', 'BG', 'HR', 'PL'],
            explanation: 'Romania bleeds talent to Western Europe while simultaneously building Europe\'s hottest tech scene. Both things are true.'
        }
    ],

    scoreMessages: {
        '0-3': {
            title: 'Tourist-Level Knowledge',
            message: 'You believe the stereotypes. Time to look at the data!'
        },
        '4-6': {
            title: 'Casual Observer',
            message: 'You know more than most, but Europe\'s economy still has surprises for you.'
        },
        '7-8': {
            title: 'Economics Nerd',
            message: 'You understand that wealth is complicated. Most people don\'t get this many right.'
        },
        '9-10': {
            title: 'Eurostat Expert',
            message: 'You either work in EU policy or you spend way too much time on data sites. Either way, impressive.'
        }
    }
};

// ── Card Generator Configuration ─────────────────────────────
CONFIG.cardTemplates = [
    {
        id: 'clean',
        name: 'Clean',
        bgColor: '#ffffff',
        textColor: '#333333',
        accentColor: '#0d6efd',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    {
        id: 'bold',
        name: 'Bold',
        bgColor: '#1a1a2e',
        textColor: '#ffffff',
        accentColor: '#e94560',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    {
        id: 'dark',
        name: 'Dark',
        bgColor: '#0f0f0f',
        textColor: '#f0f0f0',
        accentColor: '#00d4ff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    }
];

CONFIG.cardSizes = [
    { id: 'square', name: 'Square (1080x1080)', width: 1080, height: 1080, label: 'Instagram' },
    { id: 'landscape', name: 'Landscape (1200x628)', width: 1200, height: 628, label: 'Twitter/LinkedIn' }
];

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
