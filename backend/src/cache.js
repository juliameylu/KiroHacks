/**
 * cache.js — In-memory + file-backed cache for the most recent pipeline result.
 *
 * On module load, attempts to read cache.json from the backend root to pre-warm
 * the in-memory store (so cached data survives server restarts).
 *
 * Exports:
 *   get()            — returns the cached data object, or null if empty
 *   set(data)        — stores data in memory and synchronously writes to cache.json
 *   isWarm()         — returns true if there is cached data
 *   getLastUpdated() — returns the last_updated ISO string from cached data, or null
 */

const fs = require('fs');
const path = require('path');

// cache.json lives at the backend project root (one level above src/)
const CACHE_FILE = path.join(__dirname, '..', 'cache.json');

let store = null;

// Pre-warm from disk on startup
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    store = JSON.parse(raw);
    console.log('[cache] Pre-warmed from cache.json');
  }
} catch (err) {
  // File may be missing, empty, or malformed on first run — that's fine
  console.warn('[cache] Could not read cache.json on startup:', err.message);
  store = null;
}

/**
 * Returns the cached data object, or null if the cache is empty.
 * @returns {object|null}
 */
function get() {
  return store;
}

/**
 * Stores data in the in-memory store and synchronously writes it to cache.json.
 * @param {object} data — the full pipeline result to cache
 */
function set(data) {
  store = data;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[cache] Failed to write cache.json:', err.message);
  }
}

/**
 * Returns true if there is cached data in memory.
 * @returns {boolean}
 */
function isWarm() {
  return store !== null;
}

/**
 * Returns the last_updated field from the cached data, or null if unavailable.
 * @returns {string|null}
 */
function getLastUpdated() {
  return store?.last_updated ?? null;
}

module.exports = { get, set, isWarm, getLastUpdated };
