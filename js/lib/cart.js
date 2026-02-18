/**
 * Poppin Deli - Cart State Management
 * 
 * Handles cart state with localStorage persistence,
 * billing calculations, and WhatsApp order generation.
 */

// ==========================================================================
// CART CONFIGURATION
// ==========================================================================

const CART_STORAGE_KEY = 'poppin_deli_cart';
const DEFAULT_GST_PERCENT = 5;

// ==========================================================================
// CART STATE
// ==========================================================================

let cartState = {
    items: [],
    gstPercent: DEFAULT_GST_PERCENT
};

// Initialize cart from localStorage
function initCart() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
        try {
            cartState = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse cart:', e);
            cartState = { items: [], gstPercent: DEFAULT_GST_PERCENT };
        }
    }
    return cartState;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cartState }));
}

// ==========================================================================
// CART OPERATIONS
// ==========================================================================

/**
 * Add item to cart or increase quantity
 * @param {Object} item - { id, name, price, category }
 */
export function addToCart(item) {
    initCart();

    const existing = cartState.items.find(i => i.id === item.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cartState.items.push({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            category: item.category || '',
            qty: 1
        });
    }

    saveCart();
    return getItemQty(item.id);
}

/**
 * Remove item from cart or decrease quantity
 * @param {string} itemId - Item ID
 */
export function removeFromCart(itemId) {
    initCart();

    const existing = cartState.items.find(i => i.id === itemId);
    if (existing) {
        existing.qty -= 1;
        if (existing.qty <= 0) {
            cartState.items = cartState.items.filter(i => i.id !== itemId);
        }
    }

    saveCart();
    return getItemQty(itemId);
}

/**
 * Set exact quantity for item
 * @param {string} itemId - Item ID
 * @param {number} qty - New quantity
 */
export function setItemQty(itemId, qty) {
    initCart();

    if (qty <= 0) {
        cartState.items = cartState.items.filter(i => i.id !== itemId);
    } else {
        const existing = cartState.items.find(i => i.id === itemId);
        if (existing) {
            existing.qty = qty;
        }
    }

    saveCart();
    return qty;
}

/**
 * Remove item completely from cart
 * @param {string} itemId - Item ID
 */
export function deleteFromCart(itemId) {
    initCart();
    cartState.items = cartState.items.filter(i => i.id !== itemId);
    saveCart();
}

/**
 * Clear entire cart
 */
export function clearCart() {
    cartState = { items: [], gstPercent: DEFAULT_GST_PERCENT };
    saveCart();
}

/**
 * Get quantity of specific item in cart
 * @param {string} itemId - Item ID
 * @returns {number} - Quantity (0 if not in cart)
 */
export function getItemQty(itemId) {
    initCart();
    const item = cartState.items.find(i => i.id === itemId);
    return item ? item.qty : 0;
}

/**
 * Get all cart items
 * @returns {Array} - Cart items
 */
export function getCartItems() {
    initCart();
    return cartState.items;
}

/**
 * Get total number of items in cart
 * @returns {number} - Total item count
 */
export function getCartCount() {
    initCart();
    return cartState.items.reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Check if cart is empty
 * @returns {boolean}
 */
export function isCartEmpty() {
    initCart();
    return cartState.items.length === 0;
}

// ==========================================================================
// BILLING CALCULATIONS
// ==========================================================================

/**
 * Set GST percentage (from site settings)
 * @param {number} percent - GST percentage
 */
export function setGstPercent(percent) {
    cartState.gstPercent = percent;
    saveCart();
}

/**
 * Get cart billing summary
 * @returns {Object} - { subtotal, gstPercent, gstAmount, total }
 */
export function getCartBilling() {
    initCart();

    const subtotal = cartState.items.reduce((sum, item) => {
        return sum + (item.price * item.qty);
    }, 0);

    const gstPercent = cartState.gstPercent || DEFAULT_GST_PERCENT;
    const gstAmount = subtotal * gstPercent / 100;
    const total = subtotal + gstAmount;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        gstPercent,
        gstAmount: Math.round(gstAmount * 100) / 100,
        total: Math.round(total * 100) / 100
    };
}

// ==========================================================================
// WHATSAPP ORDER GENERATION
// ==========================================================================

/**
 * Generate WhatsApp order message
 * @param {Object} customerInfo - { name, phone, pickupTime, notes }
 * @returns {string} - WhatsApp URL with encoded message
 */
export function generateWhatsAppOrder(customerInfo) {
    initCart();

    const billing = getCartBilling();
    const items = cartState.items;

    // Build item list
    const itemLines = items.map(item => {
        const itemTotal = item.price * item.qty;
        return `• ${item.name} x${item.qty} - ₹${itemTotal}`;
    }).join('\n');

    // Build message
    const message = `🛒 *New Pickup Order - Poppin Deli*

*Items:*
${itemLines}

*Billing:*
Subtotal: ₹${billing.subtotal}
GST (${billing.gstPercent}%): ₹${billing.gstAmount}
*Total: ₹${billing.total}*

*Pickup Details:*
Name: ${customerInfo.name}
Phone: ${customerInfo.phone}
Time: ${customerInfo.pickupTime}${customerInfo.notes ? `\nNotes: ${customerInfo.notes}` : ''}

💳 *Payment:* UPI (Screenshot attach below)
⏳ Please confirm once payment is verified!`;

    // Generate WhatsApp URL
    const phoneNumber = '918770769691'; // Poppin Deli number
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

// Auto-initialize on load
initCart();

// Export cart state getter
export function getCart() {
    initCart();
    return { ...cartState };
}
