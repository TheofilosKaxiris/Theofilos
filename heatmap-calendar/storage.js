// storage.js — localStorage management for Heatmap Calendar

const Storage = (() => {
  const TRACKS_KEY = 'heatmap_tracks';
  const ENTRIES_KEY = 'heatmap_entries';

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // --- Tracks ---

  function getTracks() {
    try {
      return JSON.parse(localStorage.getItem(TRACKS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTracks(tracks) {
    localStorage.setItem(TRACKS_KEY, JSON.stringify(tracks));
  }

  function getTrack(id) {
    return getTracks().find(t => t.id === id) || null;
  }

  function createTrack({ name, type, unit, colorScheme, goal }) {
    const tracks = getTracks();
    const track = {
      id: generateId(),
      name,
      type, // 'boolean' or 'numeric'
      unit: unit || '',
      colorScheme: colorScheme || 'green',
      goal: goal ? Number(goal) : null,
      createdAt: new Date().toISOString(),
    };
    tracks.push(track);
    saveTracks(tracks);
    return track;
  }

  function updateTrack(id, updates) {
    const tracks = getTracks();
    const idx = tracks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    if (updates.goal !== undefined) updates.goal = updates.goal ? Number(updates.goal) : null;
    tracks[idx] = { ...tracks[idx], ...updates };
    saveTracks(tracks);
    return tracks[idx];
  }

  function deleteTrack(id) {
    const tracks = getTracks().filter(t => t.id !== id);
    saveTracks(tracks);
    // Also delete all entries for this track
    const entries = getAllEntries();
    delete entries[id];
    saveAllEntries(entries);
  }

  // --- Entries ---
  // Stored as { trackId: { "YYYY-MM-DD": value, ... }, ... }

  function getAllEntries() {
    try {
      return JSON.parse(localStorage.getItem(ENTRIES_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveAllEntries(entries) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  function getEntries(trackId) {
    return getAllEntries()[trackId] || {};
  }

  function setEntry(trackId, date, value) {
    const all = getAllEntries();
    if (!all[trackId]) all[trackId] = {};
    all[trackId][date] = value;
    saveAllEntries(all);
  }

  function deleteEntry(trackId, date) {
    const all = getAllEntries();
    if (all[trackId]) {
      delete all[trackId][date];
      saveAllEntries(all);
    }
  }

  function getEntry(trackId, date) {
    const entries = getEntries(trackId);
    return entries[date] !== undefined ? entries[date] : null;
  }

  // --- Import / Export ---

  function exportAllJSON() {
    return JSON.stringify({
      tracks: getTracks(),
      entries: getAllEntries(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  function importJSON(jsonStr, mergeStrategy = 'higher') {
    const data = JSON.parse(jsonStr);
    if (!data.tracks || !data.entries) throw new Error('Invalid format');

    const existingTracks = getTracks();
    const existingEntries = getAllEntries();

    for (const track of data.tracks) {
      if (!existingTracks.find(t => t.id === track.id)) {
        existingTracks.push(track);
      }
    }
    saveTracks(existingTracks);

    for (const [trackId, entries] of Object.entries(data.entries)) {
      if (!existingEntries[trackId]) existingEntries[trackId] = {};
      for (const [date, value] of Object.entries(entries)) {
        if (existingEntries[trackId][date] !== undefined) {
          if (mergeStrategy === 'higher') {
            existingEntries[trackId][date] = Math.max(existingEntries[trackId][date], value);
          }
          // else keep existing
        } else {
          existingEntries[trackId][date] = value;
        }
      }
    }
    saveAllEntries(existingEntries);
  }

  function exportTrackCSV(trackId) {
    const track = getTrack(trackId);
    const entries = getEntries(trackId);
    if (!track) return '';
    const header = `date,value${track.unit ? ' (' + track.unit + ')' : ''}\n`;
    const rows = Object.entries(entries)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => `${date},${value}`)
      .join('\n');
    return header + rows;
  }

  function importCSV(trackId, csvStr) {
    const lines = csvStr.trim().split('\n');
    const all = getAllEntries();
    if (!all[trackId]) all[trackId] = {};
    // skip header if present
    const start = lines[0].toLowerCase().includes('date') ? 1 : 0;
    for (let i = start; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        const date = parts[0].trim();
        const value = parseFloat(parts[1].trim());
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(value)) {
          all[trackId][date] = value;
        }
      }
    }
    saveAllEntries(all);
  }

  return {
    getTracks, getTrack, createTrack, updateTrack, deleteTrack,
    getEntries, getEntry, setEntry, deleteEntry,
    exportAllJSON, importJSON, exportTrackCSV, importCSV,
    getAllEntries,
  };
})();
