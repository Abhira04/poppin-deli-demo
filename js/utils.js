// ==========================================================================
// POPPIN DELI - Utility Functions
// ==========================================================================

// WhatsApp Configuration
export const WHATSAPP_NUMBER = '918770769691'; // Replace with actual number

// Google Maps Configuration
export const GOOGLE_MAPS_URL = 'https://maps.google.com/?q=E-2/265,+Arera+Colony,+Bhopal';
export const GOOGLE_MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.5!2d77.43!3d23.23!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sArera%20Colony%2C%20Bhopal!5e0!3m2!1sen!2sin!4v1234567890';

// Phone Number
export const PHONE_NUMBER = '+918770769691';

/**
 * Generate WhatsApp link with prefilled message
 */
export function getWhatsAppLink(message = 'Hi Poppin Deli! 👋') {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate WhatsApp order link for a specific item
 */
export function getWhatsAppOrderLink(itemName) {
    const message = `Hi Poppin Deli! 🍽️\n\nI want to order: ${itemName}\n\nTakeout time:\nName:\nPhone:`;
    return getWhatsAppLink(message);
}

/**
 * Copy text to clipboard and show toast
 */
export async function copyToClipboard(text, successMessage = 'Copied!') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy');
        return false;
    }
}

/**
 * Show toast notification
 */
export function showToast(message, duration = 2500) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Load JSON data
 */
export async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to load ${url}:`, error);
        return null;
    }
}

/**
 * Format price in INR
 */
export function formatPrice(price) {
    return `₹${price}`;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Initialize scroll reveal animations
 */
export function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/**
 * Initialize staggered animations for lists
 */
export function initStaggerAnimation(containerSelector, itemSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll(itemSelector);
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(container);
}

/**
 * Get status data
 */
export async function getStatus() {
    return await loadJSON('/data/status.json');
}

/**
 * Get menu data
 */
export async function getMenu() {
    return await loadJSON('/data/menu.json');
}

/**
 * Get site settings
 */
export async function getSiteSettings() {
    return await loadJSON('/data/site.json');
}

/**
 * Get featured items
 */
export async function getFeatured() {
    return await loadJSON('/data/featured.json');
}

/**
 * Get specials (Signature Picks)
 */
export async function getSpecials() {
    return await loadJSON('/data/specials.json');
}

/**
 * Get reviews
 */
export async function getReviews() {
    return await loadJSON('/data/reviews.json');
}

/**
 * Get "Now Brewing" item
 */
export async function getNowBrewing() {
    return await loadJSON('/data/now_brewing.json');
}

/**
 * Get brand pillars
 */
export async function getPillars() {
    return await loadJSON('/data/pillars.json');
}

/**
 * Create status indicator HTML
 */
export function createStatusIndicator(status) {
    if (!status) return '';

    const statusColors = {
        green: 'green',
        yellow: 'yellow',
        red: 'red'
    };

    return `
    <div class="status-indicator">
      <span class="status-dot ${statusColors[status.status] || 'green'}"></span>
      <span class="status-label">${status.label}</span>
    </div>
  `;
}
