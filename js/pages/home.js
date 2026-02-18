// ==========================================================================
// POPPIN DELI - Home Page JavaScript
// ==========================================================================

import { initHeader } from '../components/header.js';
import { initMobileNav } from '../components/mobile-nav.js';
import {
    initScrollReveal,
    getWhatsAppLink,
    GOOGLE_MAPS_URL
} from '../utils.js';
import {
    getStatus,
    getMenu,
    getSpecials,
    getReviews,
    getNowBrewing,
    getPillars,
    getSiteSettings
} from '../lib/googleSheets.js';

// Initialize home page
document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    initMobileNav();
    initHeroAnimation();

    // Each init function wrapped in try-catch to prevent cascading failures
    try { await initLiveStatus(); } catch (e) { console.error('initLiveStatus failed:', e); }
    try { await initFeaturedItems(); } catch (e) { console.error('initFeaturedItems failed:', e); }
    try { await initLoyaltyBanner(); } catch (e) { console.error('initLoyaltyBanner failed:', e); }
    try { await initNowBrewing(); } catch (e) { console.error('initNowBrewing failed:', e); }
    try { await initSpecials(); } catch (e) { console.error('initSpecials failed:', e); }
    try { await initPillars(); } catch (e) { console.error('initPillars failed:', e); }
    try { await initReviewsFromSheet(); } catch (e) { console.error('initReviewsFromSheet failed:', e); }
    initScrollReveal();
});

/**
 * Hero section fade-in animation
 */
function initHeroAnimation() {
    const heroContent = document.querySelector('.hero-content');
    const heroCtas = document.querySelector('.hero-ctas');

    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('loaded');
        }, 100);
    }

    if (heroCtas) {
        setTimeout(() => {
            heroCtas.classList.add('loaded');
        }, 300);
    }
}

/**
 * Initialize live status indicator
 */
async function initLiveStatus() {
    const statusContainer = document.querySelector('.live-status-badge');
    if (!statusContainer) return;

    const status = await getStatus();
    if (!status) return;

    const statusColors = {
        green: { color: 'green', icon: '🟢' },
        yellow: { color: 'yellow', icon: '🟡' },
        red: { color: 'red', icon: '🔴' }
    };

    const currentStatus = statusColors[status.status] || statusColors.green;

    statusContainer.innerHTML = `
    <span class="status-dot ${currentStatus.color}"></span>
    <span>${status.label}</span>
  `;

    // Update suggestion if available
    const suggestionEl = document.querySelector('.live-status-suggestion');
    if (suggestionEl && status.suggestion) {
        suggestionEl.textContent = status.suggestion;
    }
}

/**
 * Initialize featured items from menu
 */
async function initFeaturedItems() {
    const featuredContainer = document.querySelector('.featured-grid');
    if (!featuredContainer) return;

    const menuData = await getMenu();
    if (!menuData || !menuData.items) return;

    // Get bestseller and staff pick items
    const featuredItems = menuData.items.filter(item =>
        item.tags.includes('bestseller') || item.tags.includes('staffpick')
    ).slice(0, 3);

    if (featuredItems.length === 0) return;

    featuredContainer.innerHTML = featuredItems.map(item => {
        const tag = item.tags.includes('staffpick') ? 'Staff Pick' : 'Best Seller';
        return `
      <div class="featured-card reveal">
        <div class="featured-card-image">
          <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.src='/assets/menu/placeholder.jpg'">
          <span class="featured-card-tag">${tag}</span>
        </div>
        <div class="featured-card-body">
          <h3 class="featured-card-title">${item.name}</h3>
          <p class="featured-card-price">₹${item.price}</p>
        </div>
      </div>
    `;
    }).join('');

    // Re-init scroll reveal for new elements
    initScrollReveal();
}

/**
 * Order now button handler
 */
export function handleOrderNow() {
    window.location.href = '/order.html';
}

/**
 * Initialize Loyalty Banner
 */
async function initLoyaltyBanner() {
    const banner = document.getElementById('loyaltyBanner');
    const textEl = document.getElementById('loyaltyText');
    if (!banner) return;

    const settings = await getSiteSettings();
    if (settings && settings.loyalty_text) {
        textEl.textContent = settings.loyalty_text;
        banner.style.display = 'block';
    }
}

/**
 * Initialize Now Brewing section
 */
async function initNowBrewing() {
    const section = document.getElementById('nowBrewingSection');
    const content = document.getElementById('nowBrewingContent');
    if (!section || !content) return;

    const nowBrewing = await getNowBrewing();
    if (!nowBrewing) return;

    // Get menu item details
    const menuData = await getMenu();
    if (!menuData || !menuData.items) return;

    const menuItem = menuData.items.find(item => item.id == nowBrewing.menu_item_id);
    if (!menuItem) return;

    content.innerHTML = `
        <div class="now-brewing-item">
            <div class="now-brewing-info">
                <h3>${menuItem.name}</h3>
                <p>${menuItem.description || ''}</p>
                <div class="now-brewing-meta">
                    <span class="now-brewing-price">₹${menuItem.price}</span>
                    <span class="now-brewing-label">${nowBrewing.label || 'Today Only'}</span>
                </div>
            </div>
            ${menuItem.imageUrl ? `<img src="${menuItem.imageUrl}" alt="${menuItem.name}" class="now-brewing-image" onerror="this.style.display='none'">` : ''}
        </div>
    `;

    section.style.display = 'block';
}

/**
 * Initialize Signature Specials section
 */
async function initSpecials() {
    const section = document.getElementById('specialsSection');
    const grid = document.getElementById('specialsGrid');
    if (!section || !grid) return;

    const specials = await getSpecials();
    if (!specials || specials.length === 0) return;

    // Get menu data
    const menuData = await getMenu();
    if (!menuData || !menuData.items) return;

    // Match specials with menu items
    const specialItems = specials.map(special => {
        const menuItem = menuData.items.find(item => item.id == special.menu_item_id);
        return menuItem ? { ...menuItem, specialTag: special.tag } : null;
    }).filter(Boolean).slice(0, 3);

    if (specialItems.length === 0) return;

    grid.innerHTML = specialItems.map(item => `
        <div class="special-card reveal">
            <div class="special-card-image">
                <img src="${item.imageUrl || '/assets/menu/placeholder.jpg'}" alt="${item.name}" loading="lazy" onerror="this.src='/assets/menu/placeholder.jpg'">
                <span class="special-tag">${item.specialTag || 'Special'}</span>
            </div>
            <div class="special-card-body">
                <h3>${item.name}</h3>
                <p class="special-card-desc">${item.description || ''}</p>
                <span class="special-card-price">₹${item.price}</span>
            </div>
        </div>
    `).join('');

    section.style.display = 'block';
}

/**
 * Initialize Brand Pillars section
 */
async function initPillars() {
    const section = document.getElementById('pillarsSection');
    const grid = document.getElementById('pillarsGrid');
    if (!section || !grid) return;

    const pillars = await getPillars();
    if (!pillars || pillars.length === 0) return;

    grid.innerHTML = pillars.map(pillar => `
        <div class="pillar-card reveal">
            <span class="pillar-icon">${pillar.icon}</span>
            <h3>${pillar.title}</h3>
            <p>${pillar.description}</p>
        </div>
    `).join('');

    section.style.display = 'block';
}

/**
 * Initialize Reviews from Google Sheets
 */
async function initReviewsFromSheet() {
    const reviewsGrid = document.querySelector('.reviews-grid');
    if (!reviewsGrid) return;

    const reviews = await getReviews();
    if (!reviews || reviews.length === 0) return;

    // Render reviews
    reviewsGrid.innerHTML = reviews.slice(0, 6).map(review => {
        const stars = '★'.repeat(Math.min(parseInt(review.rating) || 5, 5));
        const initial = review.name ? review.name.charAt(0).toUpperCase() : 'G';

        return `
            <div class="review-card reveal">
                <div class="review-card-header">
                    <div class="review-avatar">${initial}</div>
                    <div>
                        <div class="review-author">${review.name}</div>
                        <div class="reviews-stars" style="font-size: 14px;">${stars}</div>
                    </div>
                </div>
                <p class="review-text">"${review.text}"</p>
            </div>
        `;
    }).join('');

    // Update average rating
    const avgRating = reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 5), 0) / reviews.length;
    const ratingEl = document.querySelector('.reviews-rating span');
    if (ratingEl) ratingEl.textContent = avgRating.toFixed(1);

    initScrollReveal();
}
