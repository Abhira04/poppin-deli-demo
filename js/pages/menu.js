// ==========================================================================
// POPPIN DELI - Menu Page JavaScript with Cart Integration
// ==========================================================================

import { initHeader } from '../components/header.js';
import { initMobileNav } from '../components/mobile-nav.js';
import {
    getMenu,
    debounce,
    initScrollReveal
} from '../utils.js';
import {
    addToCart,
    removeFromCart,
    getItemQty,
    getCartItems,
    getCartCount,
    getCartBilling,
    isCartEmpty,
    deleteFromCart,
    clearCart,
    generateWhatsAppOrder
} from '../lib/cart.js';

let menuData = null;
let activeFilters = new Set();
let searchQuery = '';

// Initialize menu page
document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    initMobileNav();

    menuData = await getMenu();
    if (menuData) {
        renderMenu();
        initSearch();
        initCategoryTabs();
        initFilterChips();
        initScrollspy();
        handleHashNavigation();
    }

    initScrollReveal();
    initCart();
});

/**
 * Initialize cart functionality
 */
function initCart() {
    // Cart icon button
    const cartIconBtn = document.getElementById('cartIconBtn');
    if (cartIconBtn) {
        cartIconBtn.addEventListener('click', openCartDrawer);
    }

    // Close button
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeCartDrawer);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCartDrawer);

    // Checkout modal
    document.getElementById('checkoutCloseBtn')?.addEventListener('click', closeCheckout);

    // Checkout form
    document.getElementById('checkoutForm')?.addEventListener('submit', handleCheckout);

    // Initial badge update
    updateCartBadge();

    // Listen for cart updates
    window.addEventListener('cart-updated', () => {
        updateCartBadge();
        renderMenu(); // Re-render to update qty controls
    });
}

/**
 * Render all menu categories and items
 */
function renderMenu() {
    const menuContent = document.querySelector('.menu-content');
    if (!menuContent || !menuData) return;

    const filteredItems = getFilteredItems();

    // Group items by category
    const groupedItems = {};
    menuData.categories.forEach(cat => {
        groupedItems[cat.id] = {
            ...cat,
            items: filteredItems.filter(item => item.category === cat.id)
        };
    });

    // Check if no results
    const totalItems = Object.values(groupedItems).reduce((sum, cat) => sum + cat.items.length, 0);

    if (totalItems === 0) {
        menuContent.innerHTML = `
      <div class="no-results">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3>No items found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
        return;
    }

    // Render categories
    let html = '';
    menuData.categories.forEach(cat => {
        const categoryItems = groupedItems[cat.id];
        if (categoryItems.items.length === 0) return;

        html += `
      <section class="menu-category" id="${cat.id}">
        <div class="menu-category-header">
          <h2>${cat.name}</h2>
          <p>${cat.description}</p>
        </div>
        <div class="menu-items-grid">
          ${categoryItems.items.map(item => renderMenuItem(item)).join('')}
        </div>
      </section>
    `;
    });

    // Add story section at the end
    html += `
    <div class="menu-story">
      <h3>A little deli in the heart of Arera.</h3>
      <p>Fresh ingredients, hearty bites, and a cozy vibe in Arera Colony.</p>
      <a href="/visit.html" class="btn btn-accent">Read Our Story</a>
    </div>
  `;

    menuContent.innerHTML = html;

    // Attach event listeners to cart buttons
    attachCartButtonListeners();
}

/**
 * Render a single menu item card
 */
function renderMenuItem(item) {
    const tagLabels = {
        bestseller: 'Best Seller',
        staffpick: 'Staff Pick',
        veg: 'Veg',
        spicy: 'Spicy'
    };

    const tagsHtml = item.tags.map(tag => {
        const label = tagLabels[tag] || tag;
        return `<span class="menu-item-tag ${tag}">${label}</span>`;
    }).join('');

    const qty = getItemQty(item.id);
    const isAvailable = item.isAvailable !== false;

    // Cart controls - either Add button or Qty controls
    let cartHtml;
    if (!isAvailable) {
        cartHtml = `<button class="add-to-cart-btn" disabled>Unavailable</button>`;
    } else if (qty > 0) {
        cartHtml = `
        <div class="menu-item-qty">
            <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Decrease">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <span class="qty-value">${qty}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}" aria-label="Increase">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>`;
    } else {
        cartHtml = `
        <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-category="${item.category}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
        </button>`;
    }

    return `
    <div class="menu-item-card" data-id="${item.id}">
      <div class="menu-item-image">
        <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'">
        ${tagsHtml ? `<div class="menu-item-tags">${tagsHtml}</div>` : ''}
      </div>
      <div class="menu-item-body">
        <h3 class="menu-item-name">${item.name}</h3>
        <p class="menu-item-description">${item.description}</p>
        <div class="menu-item-footer">
          <span class="menu-item-price">₹${item.price}</span>
          ${cartHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners to cart buttons
 */
function attachCartButtonListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { id, name, price, category } = e.currentTarget.dataset;
            addToCart({ id, name, price: parseFloat(price), category });
            updateCartBadge();
            renderMenu();
        });
    });

    // Quantity decrease
    document.querySelectorAll('.menu-item-qty .qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeFromCart(id);
            updateCartBadge();
            renderMenu();
        });
    });

    // Quantity increase
    document.querySelectorAll('.menu-item-qty .qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = menuData.items.find(i => i.id === id);
            if (item) {
                addToCart({ id: item.id, name: item.name, price: item.price, category: item.category });
            }
            updateCartBadge();
            renderMenu();
        });
    });
}

/**
 * Get filtered items based on search and active filters
 */
function getFilteredItems() {
    if (!menuData) return [];

    let items = [...menuData.items];

    // Apply search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
    }

    // Apply tag filters
    if (activeFilters.size > 0) {
        items = items.filter(item =>
            [...activeFilters].some(filter => item.tags.includes(filter))
        );
    }

    return items;
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.querySelector('.menu-search input');
    const searchContainer = document.querySelector('.menu-search');
    const clearBtn = document.querySelector('.menu-search .clear-btn');

    if (!searchInput) return;

    const handleSearch = debounce((value) => {
        searchQuery = value;
        renderMenu();

        // Toggle has-value class
        if (value) {
            searchContainer.classList.add('has-value');
        } else {
            searchContainer.classList.remove('has-value');
        }
    }, 300);

    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            searchContainer.classList.remove('has-value');
            renderMenu();
            searchInput.focus();
        });
    }
}

/**
 * Initialize category tabs
 */

function initCategoryTabs() {
    const container = document.getElementById('category-tabs-container');
    if (!container || !menuData) return;

    // Render tabs dynamically
    let html = '';
    menuData.categories.forEach((cat, index) => {
        // First tab is active by default
        const activeClass = index === 0 ? ' active' : '';
        html += `<button class="category-tab${activeClass}" data-category="${cat.id}">${cat.name}</button>`;
    });

    container.innerHTML = html;

    // Attach listeners
    const tabs = container.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const categoryId = tab.dataset.category;
            const categorySection = document.getElementById(categoryId);

            if (categorySection) {
                // Offset for header
                const headerOffset = 80;
                const elementPosition = categorySection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }

            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

/**
 * Initialize filter chips
 */
function initFilterChips() {
    const chips = document.querySelectorAll('.filter-chip');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const filter = chip.dataset.filter;

            if (activeFilters.has(filter)) {
                activeFilters.delete(filter);
                chip.classList.remove('active');
            } else {
                activeFilters.add(filter);
                chip.classList.add('active');
            }

            renderMenu();
        });
    });
}

/**
 * Initialize scrollspy for category tabs
 */
function initScrollspy() {
    const categories = document.querySelectorAll('.menu-category');
    const tabs = document.querySelectorAll('.category-tab');

    if (categories.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const categoryId = entry.target.id;

                tabs.forEach(tab => {
                    if (tab.dataset.category === categoryId) {
                        tab.classList.add('active');
                        // Scroll tab into view
                        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } else {
                        tab.classList.remove('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    categories.forEach(cat => observer.observe(cat));
}

/**
 * Handle hash navigation (e.g., /menu.html#breakfast)
 */
function handleHashNavigation() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        setTimeout(() => {
            const section = document.getElementById(hash);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
}

// ==========================================================================
// CART DRAWER FUNCTIONS
// ==========================================================================

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = getCartCount();

    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (drawer && overlay) {
        renderCartItems();
        renderCartFooter();
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function renderCartItems() {
    const content = document.getElementById('cartDrawerContent');
    if (!content) return;

    const items = getCartItems();

    if (items.length === 0) {
        content.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious items from our menu!</p>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div class="cart-items">
            ${items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">₹${item.price}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn cart-qty-minus" data-id="${item.id}" aria-label="Decrease">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn cart-qty-plus" data-id="${item.id}" aria-label="Increase">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="cart-item-total">₹${item.price * item.qty}</span>
                        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Attach event listeners
    content.querySelectorAll('.cart-qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeFromCart(e.currentTarget.dataset.id);
            renderCartItems();
            renderCartFooter();
            updateCartBadge();
            renderMenu();
        });
    });

    content.querySelectorAll('.cart-qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = getCartItems().find(i => i.id === id);
            if (item) addToCart(item);
            renderCartItems();
            renderCartFooter();
            updateCartBadge();
            renderMenu();
        });
    });

    content.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteFromCart(e.currentTarget.dataset.id);
            renderCartItems();
            renderCartFooter();
            updateCartBadge();
            renderMenu();
        });
    });
}

function renderCartFooter() {
    const footer = document.getElementById('cartDrawerFooter');
    if (!footer) return;

    if (isCartEmpty()) {
        footer.innerHTML = '';
        return;
    }

    const billing = getCartBilling();

    footer.innerHTML = `
        <div class="cart-billing">
            <div class="billing-row">
                <span>Subtotal</span>
                <span>₹${billing.subtotal}</span>
            </div>
            <div class="billing-row billing-gst">
                <span>GST (${billing.gstPercent}%)</span>
                <span>₹${billing.gstAmount}</span>
            </div>
            <div class="billing-row billing-total">
                <span>Total</span>
                <span>₹${billing.total}</span>
            </div>
        </div>
        <button class="btn btn-primary btn-lg cart-checkout-btn" id="cartCheckoutBtn">
            Proceed to Takeout Checkout
        </button>
        <button class="btn btn-ghost cart-clear-btn" id="cartClearBtn">
            Clear Cart
        </button>
    `;

    document.getElementById('cartCheckoutBtn')?.addEventListener('click', openCheckout);
    document.getElementById('cartClearBtn')?.addEventListener('click', () => {
        clearCart();
        renderCartItems();
        renderCartFooter();
        updateCartBadge();
        renderMenu();
    });
}

function openCheckout() {
    closeCartDrawer();
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        // Reset to step 1
        currentStep = 1;
        updateCheckoutStep();
        renderCheckoutSummary();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Set default Takeout time (30 mins from now)
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const timeString = now.toTimeString().slice(0, 5);
        document.getElementById('TakeoutTime').value = timeString;

        // Initialize step navigation
        initCheckoutSteps();
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        // Reset screenshot
        paymentScreenshotFile = null;
        const preview = document.getElementById('screenshotPreview');
        const label = document.getElementById('uploadLabel');
        if (preview) preview.style.display = 'none';
        if (label) label.style.display = 'flex';
    }
}

// Multi-step checkout state
let currentStep = 1;
let paymentScreenshotFile = null;

function initCheckoutSteps() {
    // Step navigation buttons
    document.getElementById('goToPayment')?.addEventListener('click', () => {
        // Validate step 1 fields
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const time = document.getElementById('TakeoutTime').value;

        if (!name || !phone || !time) {
            alert('Please fill in all required fields');
            return;
        }

        currentStep = 2;
        updateCheckoutStep();
        updatePaymentAmount();
    });

    document.getElementById('backToDetails')?.addEventListener('click', () => {
        currentStep = 1;
        updateCheckoutStep();
    });

    document.getElementById('goToConfirm')?.addEventListener('click', () => {
        // Validate screenshot
        if (!paymentScreenshotFile) {
            alert('Please attach your payment screenshot');
            return;
        }

        currentStep = 3;
        updateCheckoutStep();
        renderOrderReview();
    });

    document.getElementById('backToPayment')?.addEventListener('click', () => {
        currentStep = 2;
        updateCheckoutStep();
    });

    // Copy UPI ID
    document.getElementById('copyUpiBtn')?.addEventListener('click', () => {
        const upiId = document.getElementById('upiId').textContent;
        navigator.clipboard.writeText(upiId).then(() => {
            const btn = document.getElementById('copyUpiBtn');
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 2000);
        });
    });

    // Screenshot upload
    const screenshotInput = document.getElementById('paymentScreenshot');
    screenshotInput?.addEventListener('change', handleScreenshotUpload);

    document.getElementById('removeScreenshot')?.addEventListener('click', () => {
        paymentScreenshotFile = null;
        document.getElementById('paymentScreenshot').value = '';
        document.getElementById('screenshotPreview').style.display = 'none';
        document.getElementById('uploadLabel').style.display = 'flex';
    });
}

function updateCheckoutStep() {
    const stepIndicators = document.querySelectorAll('.checkout-step');
    const stepContents = {
        1: document.getElementById('step1Content'),
        2: document.getElementById('step2Content'),
        3: document.getElementById('step3Content')
    };

    // Update step indicators
    stepIndicators.forEach(indicator => {
        const step = parseInt(indicator.dataset.step);
        indicator.classList.remove('active', 'completed');
        if (step < currentStep) {
            indicator.classList.add('completed');
        } else if (step === currentStep) {
            indicator.classList.add('active');
        }
    });

    // Show/hide step content
    Object.entries(stepContents).forEach(([step, content]) => {
        if (content) {
            content.style.display = parseInt(step) === currentStep ? 'block' : 'none';
        }
    });

    // Update title
    const titles = {
        1: 'Takeout Details',
        2: 'Make Payment',
        3: 'Confirm Order'
    };
    const titleEl = document.getElementById('checkoutTitle');
    if (titleEl) titleEl.textContent = titles[currentStep];
}

function updatePaymentAmount() {
    const billing = getCartBilling();
    const amountEl = document.getElementById('paymentAmount');
    if (amountEl) amountEl.textContent = `₹${billing.total}`;
}

function handleScreenshotUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    paymentScreenshotFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById('screenshotPreview');
        const previewImg = document.getElementById('previewImage');
        const label = document.getElementById('uploadLabel');

        if (previewImg) previewImg.src = event.target.result;
        if (preview) preview.style.display = 'block';
        if (label) label.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function renderCheckoutSummary() {
    const summary = document.getElementById('checkoutSummary');
    if (!summary) return;

    const billing = getCartBilling();
    const items = getCartItems();

    summary.innerHTML = `
        <div class="checkout-order-summary">
            <h4>Order Summary</h4>
            <div class="checkout-items">
                ${items.map(item => `
                    <div class="checkout-item">
                        <span>${item.name} x${item.qty}</span>
                        <span>₹${item.price * item.qty}</span>
                    </div>
                `).join('')}
            </div>
            <div class="checkout-billing">
                <div class="billing-row">
                    <span>Subtotal</span>
                    <span>₹${billing.subtotal}</span>
                </div>
                <div class="billing-row">
                    <span>GST (${billing.gstPercent}%)</span>
                    <span>₹${billing.gstAmount}</span>
                </div>
                <div class="billing-row billing-total">
                    <span>Total</span>
                    <span>₹${billing.total}</span>
                </div>
            </div>
        </div>
    `;
}

function renderOrderReview() {
    const review = document.getElementById('orderReview');
    if (!review) return;

    const billing = getCartBilling();
    const items = getCartItems();
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const time = document.getElementById('TakeoutTime').value;
    const notes = document.getElementById('orderNotes').value;

    review.innerHTML = `
        <div class="order-review-section">
            <h5>Customer</h5>
            <p>${name} • ${phone}</p>
        </div>
        <div class="order-review-section">
            <h5>Takeout Time</h5>
            <p>${time}</p>
        </div>
        ${notes ? `
        <div class="order-review-section">
            <h5>Notes</h5>
            <p>${notes}</p>
        </div>
        ` : ''}
        <div class="order-review-section">
            <h5>Items</h5>
            <div class="review-items">
                ${items.map(item => `
                    <div class="review-item">
                        <span>${item.name} x${item.qty}</span>
                        <span>₹${item.price * item.qty}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="order-review-section">
            <h5>Total (incl. GST)</h5>
            <p class="review-total">₹${billing.total}</p>
        </div>
        <div class="order-review-section">
            <h5>Payment</h5>
            <p>✅ Screenshot attached</p>
        </div>
    `;
}

function handleCheckout(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const customerInfo = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        TakeoutTime: formData.get('TakeoutTime'),
        notes: formData.get('notes')
    };

    const whatsappUrl = generateWhatsAppOrder(customerInfo);

    // Clear cart after order
    clearCart();
    closeCheckout();
    updateCartBadge();
    renderMenu();

    // Open WhatsApp - user will need to attach screenshot manually
    // Show instruction alert
    alert('WhatsApp will open now. Please attach your payment screenshot to complete the order!');
    window.open(whatsappUrl, '_blank');
}
