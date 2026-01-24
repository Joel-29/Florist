// PWA: Service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then((registration) =>
      console.log('Service Worker registered with scope:', registration.scope)
    )
    .catch((error) => console.log('Service Worker registration failed:', error));
}

// UI: reveal-on-scroll + mobile navigation
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle (hamburger)
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('a.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Navbar scroll styling
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal content that starts hidden (opacity: 0) until it gets `.visible`
  const revealElements = document.querySelectorAll(
    '.section-title, .section-subtitle, .glass-card, .arrangement-card'
  );

  const reveal = (el) => el.classList.add('visible');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        // Start revealing slightly before fully in-view
        rootMargin: '0px 0px -10% 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(reveal);
  }
});
