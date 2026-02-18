/**
 * Poppin Deli - Google Sheets CMS Integration
 * 
 * This module fetches data from public Google Sheets to allow
 * the cafe owner to update content without touching code.
 * 
 * Each data type has its own Google Sheet for easier management.
 */

// ============================================
// CONFIGURATION - YOUR GOOGLE SHEET IDs
// ============================================
const SHEET_IDS = {
    status: '1OIGx_iPzHohQ0lcOeNdC0czcZiMQYrCK77sqTgXYBgg',
    menu: '1V_SXJbiDPdXy5mXewtCEkeWAnCVg6M9lnBEVMaTfhyQ',
    featured: '101WGAAUvBX3UJzW86Rtu7GJGnfweiXEs7gBm9dpxJl4',
    site: '1Wx8Dzeybc6ndakYJoyMd_a6rBgUgzyb82OVnGR8Yh0w',
    specials: '', // TODO: Add sheet ID for Signature Picks
    reviews: '',  // TODO: Add sheet ID for Google Reviews
    now_brewing: '', // TODO: Add sheet ID for Today's Special
    pillars: ''  // TODO: Add sheet ID for Brand Pillars
};

// Cache duration in milliseconds (1 minute for faster updates)
const CACHE_DURATION = 1 * 60 * 1000;

// Local storage keys for caching
const CACHE_KEYS = {
    status: 'poppin_status_cache',
    menu: 'poppin_menu_cache',
    featured: 'poppin_featured_cache',
    gallery: 'poppin_gallery_cache',
    site: 'poppin_site_cache',
    specials: 'poppin_specials_cache',
    reviews: 'poppin_reviews_cache',
    now_brewing: 'poppin_now_brewing_cache',
    pillars: 'poppin_pillars_cache'
};

// ============================================
// GOOGLE SHEETS API HELPER
// ============================================

/**
 * Fetches data from a specific Google Sheet
 * @param {string} sheetType - Type of sheet (status, menu, featured, site)
 * @returns {Promise<Array>} - Array of row objects
 */
async function fetchSheet(sheetType) {
    const sheetId = SHEET_IDS[sheetType];
    if (!sheetId) {
        console.error(`No sheet ID configured for: ${sheetType}`);
        return null;
    }

    // For separate sheets, use Sheet1 as the default tab name
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        // Google returns JSONP, we need to extract the JSON
        // Format: google.visualization.Query.setResponse({...})
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        const jsonString = text.substring(jsonStart, jsonEnd + 1);
        const data = JSON.parse(jsonString);

        // Parse the table structure
        return parseGoogleSheetData(data);
    } catch (error) {
        console.error(`Failed to fetch ${sheetType} from Google Sheets:`, error);
        return null;
    }
}

/**
 * Parses Google Visualization API response into clean objects
 * @param {Object} data - Raw Google Sheets response
 * @returns {Array} - Array of row objects with column headers as keys
 */
function parseGoogleSheetData(data) {
    if (!data.table || !data.table.rows || data.table.rows.length === 0) return [];

    const { cols, rows } = data.table;

    // Check if column labels exist - if not, use first row as headers
    const hasLabels = cols.some(col => col.label && col.label.trim() !== '');

    let headers;
    let dataRows;

    if (hasLabels) {
        // Use column labels as headers
        headers = cols.map(col => col.label || col.id);
        dataRows = rows;
    } else {
        // First row contains headers, extract them
        const firstRow = rows[0];
        headers = firstRow.c.map(cell => cell ? (cell.v || '') : '');
        dataRows = rows.slice(1); // Skip header row
    }

    // Convert rows to objects
    return dataRows.map(row => {
        const obj = {};
        if (row.c) {
            row.c.forEach((cell, index) => {
                const header = headers[index];
                if (header && header.toString().trim()) {
                    obj[header] = cell ? (cell.v !== null ? cell.v : '') : '';
                }
            });
        }
        return obj;
    }).filter(obj => Object.keys(obj).length > 0);
}

// ============================================
// CACHING HELPERS
// ============================================

function getCachedData(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
            return data;
        }
        return null;
    } catch {
        return null;
    }
}

function setCachedData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch {
        // localStorage might be full or disabled
    }
}

// ============================================
// DATA FETCHERS WITH FALLBACKS
// ============================================

/**
 * Fetches live status from Google Sheets
 * Falls back to local status.json if unavailable
 */
export async function getStatus() {
    // Try cache first
    const cached = getCachedData(CACHE_KEYS.status);
    if (cached) return cached;

    // Try Google Sheets
    const rows = await fetchSheet('status');

    if (rows && rows.length > 0) {
        // Convert rows to key-value object
        const status = {};
        rows.forEach(row => {
            if (row.key) {
                status[row.key] = row.value;
                if (row.note) status[row.key + '_note'] = row.note;
            }
        });

        // Transform to our expected format
        const result = {
            status: status.vibe_status || 'green',
            label: status.vibe_label || 'Open Now',
            note: status.vibe_subtext || '',
            waitTime: parseInt(status.wait_time) || 0,
            suggestion: status.vibe_subtext || ''
        };

        setCachedData(CACHE_KEYS.status, result);
        return result;
    }

    // Fallback to local JSON
    try {
        const response = await fetch('/data/status.json');
        return await response.json();
    } catch {
        return {
            status: 'green',
            label: 'Open Now',
            note: '',
            waitTime: 0,
            suggestion: ''
        };
    }
}

/**
 * Fetches menu from Google Sheets
 * Falls back to local menu.json if unavailable
 */
export async function getMenu() {
    // Try cache first
    const cached = getCachedData(CACHE_KEYS.menu);
    if (cached) return cached;

    // Try Google Sheets
    const rows = await fetchSheet('menu');

    if (rows && rows.length > 0) {
        // Transform to our expected format
        const items = rows
            .filter(row => row.isAvailable !== 'FALSE' && row.isAvailable !== false)
            .map(row => ({
                id: row.id,
                name: row.name,
                category: row.category,
                description: row.description,
                price: parseFloat(row.price) || 0,
                isVeg: row.isVeg === 'TRUE' || row.isVeg === true,
                tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
                imageUrl: row.imageUrl || null,
                sortOrder: parseInt(row.sortOrder) || 999
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // Group by category
        const categories = [...new Set(items.map(i => i.category))];

        const result = {
            categories: categories.map(cat => ({
                id: cat.toLowerCase().replace(/\s+/g, '-'),
                name: cat,
                description: ''
            })),
            items
        };

        setCachedData(CACHE_KEYS.menu, result);
        return result;
    }

    // Fallback to local JSON
    try {
        const response = await fetch('/data/menu.json');
        return await response.json();
    } catch {
        return { categories: [], items: [] };
    }
}

/**
 * Fetches featured items from Google Sheets
 */
export async function getFeatured() {
    const cached = getCachedData(CACHE_KEYS.featured);
    if (cached) return cached;

    const rows = await fetchSheet('featured');

    if (rows && rows.length > 0) {
        const result = rows
            .map(row => ({
                id: row.id,
                menuItemId: row.menuItemId,
                titleOverride: row.titleOverride || null,
                tag: row.tag || 'Featured',
                sortOrder: parseInt(row.sortOrder) || 999
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);

        setCachedData(CACHE_KEYS.featured, result);
        return result;
    }

    return null; // Will use default featured logic
}

/**
 * Fetches gallery images from Google Sheets
 */
export async function getGallery(type = null) {
    const cached = getCachedData(CACHE_KEYS.gallery);
    let data = cached;

    if (!data) {
        const rows = await fetchSheet('gallery');

        if (rows && rows.length > 0) {
            data = rows
                .filter(row => row.isActive !== 'FALSE' && row.isActive !== false)
                .map(row => ({
                    id: row.id,
                    imageUrl: row.imageUrl,
                    type: row.type || 'general',
                    caption: row.caption || '',
                    sortOrder: parseInt(row.sortOrder) || 999
                }))
                .sort((a, b) => a.sortOrder - b.sortOrder);

            setCachedData(CACHE_KEYS.gallery, data);
        }
    }

    if (data && type) {
        return data.filter(img => img.type === type);
    }

    return data || [];
}

/**
 * Fetches site settings from Google Sheets
 */
export async function getSiteSettings() {
    const cached = getCachedData(CACHE_KEYS.site);
    if (cached) return cached;

    const rows = await fetchSheet('site');

    if (rows && rows.length > 0) {
        const settings = {};
        rows.forEach(row => {
            if (row.key) {
                settings[row.key] = row.value;
            }
        });

        setCachedData(CACHE_KEYS.site, settings);
        return settings;
    }

    // Default settings
    return {
        phone_primary: '+91 87707 69691',
        address: 'E-2/265, Arera Colony, Bhopal',
        open_time: '11:00',
        close_time: '23:00',
        whatsapp_number: '918770769691'
    };
}

// Fetches specials (Signature Picks) from Google Sheets
export async function getSpecials() {
    // Check cache first
    const cached = getCachedData(CACHE_KEYS.specials);
    if (cached) return cached;

    // Try Google Sheets if configured
    if (SHEET_IDS.specials) {
        try {
            const rows = await fetchSheet('specials');
            if (rows && rows.length > 0) {
                const specials = rows.filter(r => r.active === 'TRUE');
                setCachedData(CACHE_KEYS.specials, specials);
                return specials;
            }
        } catch (error) {
            console.warn('Failed to fetch specials from Google Sheets:', error);
        }
    }

    // Fallback to local JSON
    try {
        const response = await fetch('/data/specials.json');
        if (response.ok) {
            const data = await response.json();
            return data.filter(r => r.active === true || r.active === 'TRUE');
        }
    } catch (error) {
        console.warn('Failed to fetch local specials:', error);
    }

    return [];
}

// Fetches reviews from Google Sheets
export async function getReviews() {
    // Check cache first
    const cached = getCachedData(CACHE_KEYS.reviews);
    if (cached) return cached;

    // Try Google Sheets if configured
    if (SHEET_IDS.reviews) {
        try {
            const rows = await fetchSheet('reviews');
            if (rows && rows.length > 0) {
                setCachedData(CACHE_KEYS.reviews, rows);
                return rows;
            }
        } catch (error) {
            console.warn('Failed to fetch reviews from Google Sheets:', error);
        }
    }

    // Fallback to local JSON
    try {
        const response = await fetch('/data/reviews.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Failed to fetch local reviews:', error);
    }

    return [];
}

// Fetches "Now Brewing" item from Google Sheets
export async function getNowBrewing() {
    // Check cache first
    const cached = getCachedData(CACHE_KEYS.now_brewing);
    if (cached) return cached;

    // Try Google Sheets if configured
    if (SHEET_IDS.now_brewing) {
        try {
            const rows = await fetchSheet('now_brewing');
            if (rows && rows.length > 0) {
                const active = rows.find(r => r.active === 'TRUE');
                if (active) {
                    setCachedData(CACHE_KEYS.now_brewing, active);
                    return active;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch now_brewing from Google Sheets:', error);
        }
    }

    // Fallback to local JSON
    try {
        const response = await fetch('/data/now_brewing.json');
        if (response.ok) {
            const data = await response.json();
            const active = Array.isArray(data)
                ? data.find(r => r.active === true || r.active === 'TRUE')
                : data;
            return active || null;
        }
    } catch (error) {
        console.warn('Failed to fetch local now_brewing:', error);
    }

    return null;
}

// Fetches brand pillars from Google Sheets
export async function getPillars() {
    // Check cache first
    const cached = getCachedData(CACHE_KEYS.pillars);
    if (cached) return cached;

    // Try Google Sheets if configured
    if (SHEET_IDS.pillars) {
        try {
            const rows = await fetchSheet('pillars');
            if (rows && rows.length > 0) {
                setCachedData(CACHE_KEYS.pillars, rows);
                return rows;
            }
        } catch (error) {
            console.warn('Failed to fetch pillars from Google Sheets:', error);
        }
    }

    // Fallback to local JSON
    try {
        const response = await fetch('/data/pillars.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Failed to fetch local pillars:', error);
    }

    return [];
}

// ============================================
// UTILITY: Check if Google Sheets is configured
// ============================================

export function isGoogleSheetsConfigured() {
    return SHEET_IDS.status && SHEET_IDS.menu;
}

// ============================================
// UTILITY: Clear all caches (for debugging)
// ============================================

export function clearAllCaches() {
    Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    console.log('All Poppin Deli caches cleared');
}
