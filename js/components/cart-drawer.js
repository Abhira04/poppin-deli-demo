/**
 * Poppin Deli - Cart Drawer Component
 * 
 * Sliding cart panel with item list, quantity controls,
 * billing summary, and checkout form.
 */

import {
    getCartItems,
    getCartCount,
    getCartBilling,
    isCartEmpty,
    removeFromCart,
    addToCart,
    deleteFromCart,
    clearCart,
    generateWhatsAppOrder
} from '../lib/cart.js';

// ==========================================================================
// CART DRAWER HTML
// ==========================================================================

export function createCartDrawer() {
    return `
    <div class="cart-overlay" id="cartOverlay"></div>
    <div class="cart-drawer" id="cartDrawer">
        <div class="cart-drawer-header">
            <h2>Your Cart</h2>
            <button class="cart-close-btn" id="cartCloseBtn" aria-label="Close cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="cart-drawer-content" id="cartDrawerContent">
            <!-- Cart items will be rendered here -->
        </div>
        
        <div class="cart-drawer-footer" id="cartDrawerFooter">
            <!-- Billing summary and checkout button -->
        </div>
    </div>
    
    <!-- Checkout Modal -->
    <div class="checkout-modal" id="checkoutModal">
        <div class="checkout-modal-content">
            <div class="checkout-modal-header">
                <h2>Takeout Details</h2>
                <button class="checkout-close-btn" id="checkoutCloseBtn" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="checkoutForm" class="checkout-form">
                <div class="form-group">
                    <label for="customerName">Your Name *</label>
                    <input type="text" id="customerName" name="name" required placeholder="Enter your name">
                </div>
                <div class="form-group">
                    <label for="customerPhone">Phone Number *</label>
                    <input type="tel" id="customerPhone" name="phone" required placeholder="+91 98765 43210">
                </div>
                <div class="form-group">
                    <label for="TakeoutTime">Takeout Time *</label>
                    <input type="time" id="TakeoutTime" name="TakeoutTime" required>
                </div>
                <div class="form-group">
                    <label for="orderNotes">Notes (optional)</label>
                    <textarea id="orderNotes" name="notes" placeholder="Any special requests..."></textarea>
                </div>
                <div class="checkout-summary" id="checkoutSummary">
                    <!-- Order summary -->
                </div>
                <button type="submit" class="btn btn-whatsapp btn-lg checkout-submit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                    Confirm & Order via WhatsApp
                </button>
            </form>
        </div>
    </div>
    `;
}

// ==========================================================================
// RENDER FUNCTIONS
// ==========================================================================

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
                        <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Decrease quantity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn qty-plus" data-id="${item.id}" aria-label="Increase quantity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="cart-item-total">₹${item.price * item.qty}</span>
                        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add event listeners
    content.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeFromCart(id);
            renderCartItems();
            renderCartFooter();
            updateCartBadge();
            updateMenuButtons();
        });
    });

    content.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = items.find(i => i.id === id);
            if (item) addToCart(item);
            renderCartItems();
            renderCartFooter();
            updateCartBadge();
            updateMenuButtons();
        });
    });

    content.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            deleteFromCart(id);
            renderCartItems();
            renderCartFooter();
            updateCartBadge();
            updateMenuButtons();
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
        updateMenuButtons();
    });
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

// ==========================================================================
// DRAWER CONTROLS
// ==========================================================================

export function openCartDrawer() {
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

export function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function openCheckout() {
    closeCartDrawer();
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        renderCheckoutSummary();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Set default Takeout time (30 mins from now)
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const timeString = now.toTimeString().slice(0, 5);
        document.getElementById('TakeoutTime').value = timeString;
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ==========================================================================
// CART BADGE UPDATE
// ==========================================================================

export function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = getCartCount();

    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Update menu item buttons when cart changes
function updateMenuButtons() {
    // Dispatch event for menu page to handle
    window.dispatchEvent(new CustomEvent('cart-updated'));
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

export function initCartDrawer() {
    // Close button
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeCartDrawer);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCartDrawer);

    // Checkout modal
    document.getElementById('checkoutCloseBtn')?.addEventListener('click', closeCheckout);

    // Checkout form
    document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
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
        updateMenuButtons();

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    });

    // Initial render
    updateCartBadge();

    // Listen for cart updates
    window.addEventListener('cart-updated', updateCartBadge);
}
