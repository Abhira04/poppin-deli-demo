// ==========================================================================
// POPPIN DELI - Header Component
// ==========================================================================

export function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Shrink header on scroll
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Set active nav link based on current page
    setActiveNavLink();
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.header-nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Check if this link matches current page
        if (href === currentPath ||
            (href === '/' && currentPath === '/index.html') ||
            (href === '/index.html' && currentPath === '/') ||
            currentPath.endsWith(href)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Generate header HTML
export function createHeader(activePage = 'home') {
    return `
    <header class="header">
      <div class="container">
        <div class="header-inner">
          <!-- Logo -->
          <a href="/" class="header-logo">
            <span class="header-logo-text">POPPIN' <span>Deli</span></span>
          </a>
          
          <!-- Desktop Navigation -->
          <nav class="header-nav">
            <a href="/" class="header-nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            <a href="/menu.html" class="header-nav-link ${activePage === 'menu' ? 'active' : ''}">Menu</a>
            <a href="/visit.html" class="header-nav-link ${activePage === 'visit' ? 'active' : ''}">Visit</a>
            <a href="/reservations.html" class="header-nav-link ${activePage === 'reservations' ? 'active' : ''}">Reservations</a>
          </nav>
          
          <!-- Header CTA -->
          <div class="header-cta">
            <a href="/order.html" class="btn btn-primary">Order Pickup</a>
          </div>
        </div>
      </div>
    </header>
  `;
}
