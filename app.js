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

// ============================================
// SHOPPING CART FUNCTIONALITY
// ============================================

// Cart state
let cart = [];

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('blossomCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
    updateCartCount();
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('blossomCart', JSON.stringify(cart));
}

// Update cart count badge
function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// Add item to cart
function addToCart(name, price, icon) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price: parseFloat(price),
      icon,
      quantity: 1
    });
  }
  
  saveCart();
  updateCartDisplay();
  updateCartCount();
  showCartNotification(name);
}

// Show notification when item added
function showCartNotification(itemName) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #ff69b4, #e91e63);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(233, 30, 99, 0.4);
    z-index: 9999;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = `✓ ${itemName} added to cart!`;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Update cart display
function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-icon">${item.icon}</div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="decreaseQuantity('${item.name}')">−</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="increaseQuantity('${item.name}')">+</button>
            <button class="remove-btn" onclick="removeFromCart('${item.name}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  updateCartTotal();
}

// Update cart total
function updateCartTotal() {
  const totalAmount = document.getElementById('totalAmount');
  if (totalAmount) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = `$${total.toFixed(2)}`;
  }
}

// Increase quantity
function increaseQuantity(name) {
  const item = cart.find(item => item.name === name);
  if (item) {
    item.quantity += 1;
    saveCart();
    updateCartDisplay();
    updateCartCount();
  }
}

// Decrease quantity
function decreaseQuantity(name) {
  const item = cart.find(item => item.name === name);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      saveCart();
      updateCartDisplay();
      updateCartCount();
    } else {
      removeFromCart(name);
    }
  }
}

// Remove item from cart
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
  updateCartDisplay();
  updateCartCount();
}

// Toggle cart sidebar
function toggleCart() {
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
  }
}

// Show checkout modal
function showCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutTotal = document.getElementById('checkoutTotal');
  
  if (checkoutModal && checkoutItems && checkoutTotal) {
    // Populate checkout items
    checkoutItems.innerHTML = cart.map(item => `
      <div class="checkout-item">
        <div>
          <div class="checkout-item-name">${item.icon} ${item.name}</div>
          <div class="checkout-item-quantity">Quantity: ${item.quantity}</div>
        </div>
        <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = `$${total.toFixed(2)}`;
    
    // Show modal and hide cart
    checkoutModal.classList.add('active');
    toggleCart();
  }
}

// Close checkout modal
function closeCheckout() {
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    checkoutModal.classList.remove('active');
  }
}

// Handle checkout form submission
function handleCheckout(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // Get order details
  const orderDetails = {
    customer: {
      name: document.getElementById('customerName').value,
      email: document.getElementById('customerEmail').value,
      phone: document.getElementById('customerPhone').value
    },
    address: {
      street: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value
    },
    payment: {
      cardNumber: '****' + document.getElementById('cardNumber').value.slice(-4),
      expiry: document.getElementById('expiry').value
    },
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };
  
  // Simulate order processing
  const checkoutContent = document.querySelector('.checkout-content');
  checkoutContent.innerHTML = `
    <div class="success-message">
      <h2 style="margin: 0 0 1rem 0; font-family: var(--font-display);">🌸 Order Successful! 🌸</h2>
      <p style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">Thank you for your order, ${orderDetails.customer.name}!</p>
      <p style="margin: 0; font-size: 0.95rem;">Order confirmation sent to ${orderDetails.customer.email}</p>
    </div>
    <div style="text-align: center; margin-top: 2rem;">
      <h3 style="font-family: var(--font-display); margin-bottom: 1rem;">Order Summary</h3>
      ${cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255, 105, 180, 0.05); margin-bottom: 0.5rem; border-radius: 8px;">
          <span>${item.icon} ${item.name} x${item.quantity}</span>
          <span style="font-weight: 600; color: #e91e63;">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid rgba(255, 105, 180, 0.2); font-size: 1.3rem; font-weight: 700;">
        Total: <span style="color: #e91e63;">$${orderDetails.total.toFixed(2)}</span>
      </div>
      <p style="margin-top: 2rem; color: #5a5a5a;">Estimated delivery: 2-3 business days</p>
      <button onclick="finishCheckout()" class="btn-submit-order" style="margin-top: 1rem;">Continue Shopping</button>
    </div>
  `;
  
  // Clear cart after successful order
  cart = [];
  saveCart();
  updateCartCount();
  updateCartDisplay();
  
  console.log('Order placed:', orderDetails);
}

// Finish checkout and close modal
function finishCheckout() {
  closeCheckout();
  window.location.hash = '#home';
}

// Make functions globally available
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromCart = removeFromCart;
window.finishCheckout = finishCheckout;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load cart on page load
  loadCart();
  
  // Cart toggle button
  const cartToggle = document.getElementById('cartToggle');
  if (cartToggle) {
    cartToggle.addEventListener('click', toggleCart);
  }
  
  // Cart close button
  const cartClose = document.getElementById('cartClose');
  if (cartClose) {
    cartClose.addEventListener('click', toggleCart);
  }
  
  // Cart overlay
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) {
    cartOverlay.addEventListener('click', toggleCart);
  }
  
  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', showCheckout);
  }
  
  // Checkout modal close
  const modalClose = document.getElementById('modalClose');
  if (modalClose) {
    modalClose.addEventListener('click', closeCheckout);
  }
  
  // Checkout form
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
  }
  
  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      const price = button.getAttribute('data-price');
      const icon = button.getAttribute('data-icon');
      addToCart(name, price, icon);
    });
  });
});

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
