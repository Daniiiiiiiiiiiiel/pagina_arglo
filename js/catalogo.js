import { productsData } from './data.js';

// ==================== ESTADO DE LA APLICACIÓN ====================
class AppState {
    constructor() {
        this.currentProductId = 0;
        this.cartItems = [];
        this.wishlistItems = [];
        this.cartCount = 0;
        this.wishlistCount = 0;
    }

    // Verificar disponibilidad de localStorage
    isLocalStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Cargar estado del localStorage
    loadState() {
        try {
            const savedCart = localStorage.getItem('arglo_cart');
            const savedWishlist = localStorage.getItem('arglo_wishlist');
            
            if (savedCart) {
                this.cartItems = JSON.parse(savedCart) || [];
                this.updateCartCount();
            }
            
            if (savedWishlist) {
                this.wishlistItems = JSON.parse(savedWishlist) || [];
                this.updateWishlistCount();
            }
        } catch (error) {
            console.warn('Error cargando datos guardados:', error);
            // Reiniciar a valores por defecto
            this.cartItems = [];
            this.wishlistItems = [];
            this.updateCartCount();
            this.updateWishlistCount();
        }
    }

    // Guardar estado en localStorage
    saveCart() {
        try {
            localStorage.setItem('arglo_cart', JSON.stringify(this.cartItems));
        } catch (error) {
            console.warn('Error guardando carrito:', error);
        }
    }

    saveWishlist() {
        try {
            localStorage.setItem('arglo_wishlist', JSON.stringify(this.wishlistItems));
        } catch (error) {
            console.warn('Error guardando favoritos:', error);
        }
    }

    // Actualizar contadores
    updateCartCount() {
        this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    updateWishlistCount() {
        this.wishlistCount = this.wishlistItems.length;
    }

    // Limpiar datos corruptos
    resetStorage() {
        try {
            localStorage.removeItem('arglo_cart');
            localStorage.removeItem('arglo_wishlist');
            this.cartItems = [];
            this.wishlistItems = [];
            this.updateCartCount();
            this.updateWishlistCount();
            console.log('✅ Datos reiniciados correctamente');
        } catch (error) {
            console.warn('Error reiniciando datos:', error);
        }
    }
}

// Instancia global del estado
const appState = new AppState();

// ==================== ELEMENTOS DOM ====================
const DOM = {
    // Header
    mainHeader: document.getElementById('mainHeader'),
    cartBtn: document.getElementById('cartBtn'),
    wishlistBtn: document.getElementById('wishlistBtn'),
    cartCountBadge: document.getElementById('cartCount'),
    wishlistCountBadge: document.getElementById('wishlistCount'),
    
    // Breadcrumb
    breadcrumb: document.getElementById('breadcrumb'),
    
    // Producto principal
    mainImage: document.getElementById('mainImage'),
    mainImageContainer: document.getElementById('mainImageContainer'),
    thumbnailsContainer: document.getElementById('thumbnails'),
    productTitle: document.getElementById('productTitle'),
    productStars: document.getElementById('productStars'),
    reviewCount: document.getElementById('reviewCount'),
    productPrice: document.getElementById('productPrice'),
    productDescription: document.getElementById('productDescription'),
    productMeta: document.getElementById('productMeta'),
    
    // Color y cantidad
    colorOptions: document.querySelectorAll('.color-option'),
    colorName: document.getElementById('colorName'),
    qtyInput: document.getElementById('qtyInput'),
    qtyMinus: document.getElementById('qtyMinus'),
    qtyPlus: document.getElementById('qtyPlus'),
    
    // Botones de acción
    addToCartBtn: document.getElementById('addToCartBtn'),
    wishlistActionBtn: document.getElementById('wishlistActionBtn'),
    
    // Carrito
    cartSidebar: document.getElementById('cartSidebar'),
    cartClose: document.getElementById('cartClose'),
    cartItemsContainer: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    continueShopping: document.getElementById('continueShopping'),
    
    // Wishlist
    wishlistSidebar: document.getElementById('wishlistSidebar'),
    wishlistClose: document.getElementById('wishlistClose'),
    wishlistItemsContainer: document.getElementById('wishlistItems'),
    addAllToCart: document.getElementById('addAllToCart'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    descriptionContent: document.getElementById('descriptionContent'),
    reviewsContent: document.getElementById('reviewsContent'),
    
    // Productos relacionados
    relatedProducts: document.getElementById('relatedProducts'),
    
    // Modal y notificaciones
    zoomIcon: document.getElementById('zoomIcon'),
    imageModal: document.getElementById('imageModal'),
    modalImage: document.getElementById('modalImage'),
    modalClose: document.getElementById('modalClose'),
    notification: document.getElementById('notification'),
    scrollToTop: document.getElementById('scrollToTop')
};

// ==================== FUNCIONES DE RENDERIZADO ====================

// Renderizar breadcrumb
function renderBreadcrumb(product) {
    const categories = product.categories.split(', ');
    
    DOM.breadcrumb.innerHTML = `
        <a href="../index.html">Home</a>
        <span>/</span>
        <a href="#">Shop</a>
        <span>/</span>
        <a href="#">${categories[0]}</a>
        <span>/</span>
        ${categories[1] ? `<a href="#">${categories[1]}</a><span>/</span>` : ''}
        <span>${product.title}</span>
    `;
}

// Renderizar estrellas de rating
function renderStars(rating, container) {
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        star.className = i < rating ? 'fas fa-star' : 'far fa-star';
        container.appendChild(star);
    }
}

// Renderizar thumbnails
function renderThumbnails(images) {
    DOM.thumbnailsContainer.innerHTML = images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${img.replace('w=800', 'w=200')}" alt="Vista ${index + 1}">
        </div>
    `).join('');
    
    initThumbnailEvents();
}

// Renderizar meta información
function renderProductMeta(product) {
    DOM.productMeta.innerHTML = `
        <div class="meta-item">
            <span class="meta-label">Categories:</span>
            <span class="meta-value">
                ${product.categories.split(', ').map(cat => `<a href="#">${cat}</a>`).join(', ')}
            </span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Tags:</span>
            <span class="meta-value">
                ${product.tags.split(', ').map(tag => `<a href="#">${tag}</a>`).join(', ')}
            </span>
        </div>
    `;
}

// Renderizar contenido de tabs
function renderTabsContent(product) {
    // Descripción detallada
    DOM.descriptionContent.innerHTML = `
        <p style="margin-bottom: 1.5rem; line-height: 1.8; color: var(--text-light);">
            ${product.description}
        </p>
        <p style="margin-bottom: 1.5rem; line-height: 1.8; color: var(--text-light);">
            Este producto ha sido diseñado específicamente para profesionales de la salud y trabajadores en entornos de alto riesgo, cumpliendo con las certificaciones internacionales más exigentes.
        </p>
        <p style="line-height: 1.8; color: var(--text-light);">
            <strong style="color: var(--primary-blue);">Características técnicas:</strong> Material de alta calidad, diseño ergonómico, certificaciones internacionales, empaque individual estéril.
        </p>
    `;
    
    // Reviews (ejemplo estático, puedes hacerlo dinámico)
    DOM.reviewsContent.innerHTML = `
        <div style="padding: 1.5rem; background: var(--off-white); border-radius: 14px; border-left: 4px solid var(--logo-yellow);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.8rem;">
                <strong style="font-size: 1.1rem; color: var(--text-dark);">Cliente Satisfecho</strong>
                <div class="stars">
                    ${Array(5).fill('<i class="fas fa-star"></i>').join('')}
                </div>
            </div>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.8rem;">Recientemente</p>
            <p style="line-height: 1.7; color: var(--text-dark);">
                Excelente calidad de producto. Lo uso diariamente en mi trabajo y ofrece una protección superior. El ajuste es perfecto y es muy cómodo incluso después de horas de uso.
            </p>
        </div>
    `;
}

// Renderizar productos relacionados
function renderRelatedProducts() {
    const allProducts = Object.values(productsData);
    const relatedProducts = allProducts.filter(p => p.id !== appState.currentProductId);
    
    DOM.relatedProducts.innerHTML = relatedProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.oldPrice ? '<div class="sale-badge">SALE!</div>' : ''}
            <div class="card-image">
                <img src="${product.images[0]}" alt="${product.title}" loading="lazy">
            </div>
            <div class="card-content">
                <div class="card-categories">${product.categories}</div>
                <h3 class="card-title">${product.title}</h3>
                <div class="card-rating">
                    ${Array(5).fill(0).map((_, i) => 
                        `<i class="${i < product.rating ? 'fas' : 'far'} fa-star"></i>`
                    ).join('')}
                </div>
                <div class="card-price">
                    <span class="current-price">$${product.price}</span>
                    ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    initProductCardEvents();
}

// Cargar producto principal
function loadProduct(productId) {
    const product = productsData[productId];
    if (!product) return;
    
    appState.currentProductId = productId;
    
    // Actualizar información básica
    DOM.productTitle.textContent = product.title;
    DOM.productDescription.textContent = product.description;
    
    // Actualizar precio
    if (product.oldPrice) {
        DOM.productPrice.innerHTML = `$${product.price} <span style="font-size: 1.5rem; color: var(--text-light); text-decoration: line-through; margin-left: 0.5rem;">$${product.oldPrice}</span>`;
    } else {
        DOM.productPrice.textContent = `$${product.price}`;
    }
    
    // Actualizar rating
    renderStars(product.rating, DOM.productStars);
    DOM.reviewCount.textContent = `(${product.reviews} customer reviews)`;
    
    // Actualizar imágenes
    DOM.mainImage.src = product.images[0];
    renderThumbnails(product.images);
    
    // Actualizar breadcrumb y meta
    renderBreadcrumb(product);
    renderProductMeta(product);
    
    // Actualizar tabs
    renderTabsContent(product);
    
    // Actualizar productos relacionados
    renderRelatedProducts();
    
    // Verificar si está en wishlist
    updateWishlistButton();
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== EVENTOS DE THUMBNAILS ====================
function initThumbnailEvents() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const product = productsData[appState.currentProductId];
    
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            
            DOM.mainImage.style.opacity = '0';
            DOM.mainImage.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                DOM.mainImage.src = product.images[index];
                DOM.mainImage.style.opacity = '1';
                DOM.mainImage.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

// ==================== EVENTOS DE PRODUCTOS RELACIONADOS ====================
function initProductCardEvents() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const productId = parseInt(card.dataset.productId);
            loadProduct(productId);
        });
        
        // Animación de entrada
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        card.style.transition = 'all 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(card);
    });
}

// ==================== CARRITO DE COMPRAS ====================

// Añadir al carrito
function addToCart(product, quantity, color) {
    const existingItemIndex = appState.cartItems.findIndex(item => 
        item.id === product.id && item.color === color
    );
    
    if (existingItemIndex !== -1) {
        appState.cartItems[existingItemIndex].quantity += quantity;
    } else {
        appState.cartItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: quantity,
            color: color,
            image: product.images[0]
        });
    }
    
    appState.updateCartCount();
    appState.saveCart();
    updateCartView();
    updateCartBadge();
}

// Actualizar vista del carrito
function updateCartView() {
    if (appState.cartItems.length === 0) {
        DOM.cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Tu carrito está vacío</p>';
        DOM.cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    
    DOM.cartItemsContainer.innerHTML = appState.cartItems.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
                    <div style="font-size: 0.8rem; color: var(--text-light);">Color: ${item.color}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-qty">
                        <button class="cart-qty-btn minus" data-index="${index}">-</button>
                        <input type="text" class="cart-qty-input" value="${item.quantity}" readonly>
                        <button class="cart-qty-btn plus" data-index="${index}">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
    
    DOM.cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Eventos de botones del carrito
    attachCartItemEvents();
}

// Eventos de items del carrito
function attachCartItemEvents() {
    document.querySelectorAll('.cart-qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            if (appState.cartItems[index].quantity > 1) {
                appState.cartItems[index].quantity--;
                appState.updateCartCount();
                appState.saveCart();
                updateCartView();
                updateCartBadge();
            }
        });
    });
    
    document.querySelectorAll('.cart-qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            appState.cartItems[index].quantity++;
            appState.updateCartCount();
            appState.saveCart();
            updateCartView();
            updateCartBadge();
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            appState.cartItems.splice(index, 1);
            appState.updateCartCount();
            appState.saveCart();
            updateCartView();
            updateCartBadge();
        });
    });
}

// Actualizar badge del carrito
function updateCartBadge() {
    DOM.cartCountBadge.textContent = appState.cartCount;
    DOM.cartCountBadge.style.transform = 'scale(1.3)';
    setTimeout(() => {
        DOM.cartCountBadge.style.transform = 'scale(1)';
    }, 300);
}

// ==================== WISHLIST ====================

// Toggle wishlist
function toggleWishlist() {
    const product = productsData[appState.currentProductId];
    const color = document.querySelector('.color-option.active').getAttribute('data-color');
    
    const existingItemIndex = appState.wishlistItems.findIndex(item => 
        item.id === product.id && item.color === color
    );
    
    if (existingItemIndex !== -1) {
        appState.wishlistItems.splice(existingItemIndex, 1);
    } else {
        appState.wishlistItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            color: color,
            image: product.images[0]
        });
    }
    
    appState.updateWishlistCount();
    appState.saveWishlist();
    updateWishlistView();
    updateWishlistBadge();
    updateWishlistButton();
}

// Actualizar botón de wishlist
function updateWishlistButton() {
    const product = productsData[appState.currentProductId];
    const color = document.querySelector('.color-option.active').getAttribute('data-color');
    
    const isInWishlist = appState.wishlistItems.some(item => 
        item.id === product.id && item.color === color
    );
    
    const icon = DOM.wishlistActionBtn.querySelector('i');
    const span = DOM.wishlistActionBtn.querySelector('span');
    
    if (isInWishlist) {
        DOM.wishlistActionBtn.classList.add('active');
        icon.classList.remove('far');
        icon.classList.add('fas');
        span.textContent = 'In Wishlist';
    } else {
        DOM.wishlistActionBtn.classList.remove('active');
        icon.classList.remove('fas');
        icon.classList.add('far');
        span.textContent = 'Browse Wishlist';
    }
}

// Actualizar vista del wishlist
function updateWishlistView() {
    if (appState.wishlistItems.length === 0) {
        DOM.wishlistItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No tienes productos en favoritos</p>';
        return;
    }
    
    DOM.wishlistItemsContainer.innerHTML = appState.wishlistItems.map((item, index) => `
        <div class="wishlist-item">
            <div class="wishlist-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="wishlist-item-details">
                <div class="wishlist-item-title">${item.title}</div>
                <div class="wishlist-item-price">$${item.price}</div>
                <div style="font-size: 0.8rem; color: var(--text-light);">Color: ${item.color}</div>
            </div>
            <div class="wishlist-item-actions">
                <button class="wishlist-item-add" data-index="${index}">Añadir al Carrito</button>
                <button class="wishlist-item-remove" data-index="${index}">Eliminar</button>
            </div>
        </div>
    `).join('');
    
    attachWishlistItemEvents();
}

// Eventos de items del wishlist
function attachWishlistItemEvents() {
    document.querySelectorAll('.wishlist-item-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            const item = appState.wishlistItems[index];
            const product = productsData[item.id];
            addToCart(product, 1, item.color);
            showNotification();
        });
    });
    
    document.querySelectorAll('.wishlist-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            appState.wishlistItems.splice(index, 1);
            appState.updateWishlistCount();
            appState.saveWishlist();
            updateWishlistView();
            updateWishlistBadge();
            updateWishlistButton();
        });
    });
}

// Actualizar badge del wishlist
function updateWishlistBadge() {
    DOM.wishlistCountBadge.textContent = appState.wishlistCount;
    DOM.wishlistCountBadge.style.transform = 'scale(1.3)';
    setTimeout(() => {
        DOM.wishlistCountBadge.style.transform = 'scale(1)';
    }, 300);
}

// ==================== NOTIFICACIONES ====================
function showNotification(message = 'El artículo se ha añadido al carrito') {
    const notificationText = DOM.notification.querySelector('.notification-text p');
    notificationText.textContent = message;
    
    DOM.notification.classList.add('active');
    setTimeout(() => {
        DOM.notification.classList.remove('active');
    }, 3000);
}

// ==================== MODAL DE ZOOM ====================
function openModal() {
    DOM.modalImage.src = DOM.mainImage.src;
    DOM.imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    DOM.imageModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ==================== EVENTOS GENERALES ====================

// Header scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        DOM.mainHeader.classList.add('scrolled');
        DOM.scrollToTop.classList.add('visible');
    } else {
        DOM.mainHeader.classList.remove('scrolled');
        DOM.scrollToTop.classList.remove('visible');
    }
});

// Scroll to top
DOM.scrollToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Color selector
DOM.colorOptions.forEach((option, index) => {
    option.addEventListener('click', () => {
        DOM.colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        const color = option.getAttribute('data-color');
        DOM.colorName.textContent = color;
        
        // Animación del contenedor
        DOM.mainImageContainer.style.transition = 'all 0.6s ease';
        DOM.mainImageContainer.style.transform = 'scale(0.97)';
        DOM.mainImageContainer.style.opacity = '0.8';
        
        setTimeout(() => {
            const gradients = [
                'linear-gradient(135deg, #e6f0fa 0%, rgba(255, 193, 7, 0.05) 100%)',
                'linear-gradient(135deg, #2c3e50 0%, rgba(52, 73, 94, 0.3) 100%)',
                'linear-gradient(135deg, #1a4b8c 0%, rgba(74, 144, 226, 0.3) 100%)',
                'linear-gradient(135deg, #7f8c8d 0%, rgba(149, 165, 166, 0.3) 100%)'
            ];
            DOM.mainImageContainer.style.background = gradients[index];
            DOM.mainImageContainer.style.transform = 'scale(1)';
            DOM.mainImageContainer.style.opacity = '1';
        }, 250);
        
        updateWishlistButton();
    });
});

// Controles de cantidad
DOM.qtyMinus.addEventListener('click', () => {
    let value = parseInt(DOM.qtyInput.value);
    if (value > 1) {
        DOM.qtyInput.value = value - 1;
        animateQuantity();
    }
});

DOM.qtyPlus.addEventListener('click', () => {
    let value = parseInt(DOM.qtyInput.value);
    if (value < 999) {
        DOM.qtyInput.value = value + 1;
        animateQuantity();
    }
});

DOM.qtyInput.addEventListener('change', () => {
    let value = parseInt(DOM.qtyInput.value);
    if (value < 1) DOM.qtyInput.value = 1;
    if (value > 999) DOM.qtyInput.value = 999;
});

function animateQuantity() {
    DOM.qtyInput.style.transform = 'scale(1.1)';
    DOM.qtyInput.style.color = 'var(--primary-blue)';
    setTimeout(() => {
        DOM.qtyInput.style.transform = 'scale(1)';
        DOM.qtyInput.style.color = 'var(--text-dark)';
    }, 150);
}

// Añadir al carrito
DOM.addToCartBtn.addEventListener('click', () => {
    const qty = parseInt(DOM.qtyInput.value);
    const product = productsData[appState.currentProductId];
    const color = document.querySelector('.color-option.active').getAttribute('data-color');
    
    // Animación del botón
    const originalText = DOM.addToCartBtn.innerHTML;
    DOM.addToCartBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> ADDING...</span>';
    DOM.addToCartBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
        addToCart(product, qty, color);
        showNotification();
        DOM.addToCartBtn.innerHTML = originalText;
        DOM.addToCartBtn.style.pointerEvents = 'auto';
    }, 800);
});

// Wishlist
DOM.wishlistActionBtn.addEventListener('click', toggleWishlist);

// Carrito - abrir/cerrar
DOM.cartBtn.addEventListener('click', () => {
    DOM.cartSidebar.classList.add('active');
    DOM.wishlistSidebar.classList.remove('active');
});

DOM.cartClose.addEventListener('click', () => {
    DOM.cartSidebar.classList.remove('active');
});

DOM.continueShopping.addEventListener('click', () => {
    DOM.cartSidebar.classList.remove('active');
});

// Wishlist - abrir/cerrar
DOM.wishlistBtn.addEventListener('click', () => {
    DOM.wishlistSidebar.classList.add('active');
    DOM.cartSidebar.classList.remove('active');
});

DOM.wishlistClose.addEventListener('click', () => {
    DOM.wishlistSidebar.classList.remove('active');
});

// Añadir todos al carrito desde wishlist
DOM.addAllToCart.addEventListener('click', () => {
    appState.wishlistItems.forEach(item => {
        const product = productsData[item.id];
        addToCart(product, 1, item.color);
    });
    showNotification('Todos los productos se han añadido al carrito');
    DOM.wishlistSidebar.classList.remove('active');
});

// Tabs
DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        DOM.tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Modal de zoom
DOM.zoomIcon.addEventListener('click', openModal);
DOM.modalClose.addEventListener('click', closeModal);
DOM.imageModal.addEventListener('click', (e) => {
    if (e.target === DOM.imageModal) closeModal();
});

// Atajos de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (DOM.imageModal.classList.contains('active')) {
            closeModal();
        }
        if (DOM.cartSidebar.classList.contains('active')) {
            DOM.cartSidebar.classList.remove('active');
        }
        if (DOM.wishlistSidebar.classList.contains('active')) {
            DOM.wishlistSidebar.classList.remove('active');
        }
    }
    
    if ((e.key === '+' || e.key === '=') && !e.ctrlKey) {
        e.preventDefault();
        DOM.qtyPlus.click();
    }
    
    if ((e.key === '-' || e.key === '_') && !e.ctrlKey) {
        e.preventDefault();
        DOM.qtyMinus.click();
    }
});

// Compartir en redes sociales
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
        console.log('Compartiendo en redes sociales...');
    });
});

// Prevenir zoom en doble tap (móvil)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// ==================== SINCRONIZACIÓN ENTRE PESTAÑAS ====================
function setupStorageSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'arglo_cart' && e.newValue) {
            try {
                appState.cartItems = JSON.parse(e.newValue) || [];
                appState.updateCartCount();
                updateCartView();
                updateCartBadge();
                console.log('🔄 Carrito sincronizado desde otra pestaña');
            } catch (error) {
                console.warn('Error sincronizando carrito:', error);
            }
        }
        
        if (e.key === 'arglo_wishlist' && e.newValue) {
            try {
                appState.wishlistItems = JSON.parse(e.newValue) || [];
                appState.updateWishlistCount();
                updateWishlistView();
                updateWishlistBadge();
                updateWishlistButton();
                console.log('🔄 Wishlist sincronizada desde otra pestaña');
            } catch (error) {
                console.warn('Error sincronizando wishlist:', error);
            }
        }
    });
}

// ==================== INICIALIZACIÓN ====================
function init() {
    // Verificar disponibilidad de localStorage
    if (!appState.isLocalStorageAvailable()) {
        console.warn('localStorage no disponible en este navegador');
        // Podrías mostrar un mensaje al usuario si lo deseas
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ff6b6b; color: white; padding: 10px; text-align: center; z-index: 10000;';
        notification.textContent = '⚠️ Tu navegador no soporta almacenamiento local. Los datos no se guardarán.';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
    
    // Cargar estado guardado
    appState.loadState();
    
    // Configurar sincronización entre pestañas
    setupStorageSync();
    
    // Cargar producto inicial
    loadProduct(appState.currentProductId);
    
    // Actualizar vistas
    updateCartView();
    updateWishlistView();
    updateCartBadge();
    updateWishlistBadge();
    
    console.log('✅ Arglo Médica - Sistema de Productos Optimizado');
    console.log('📦 Productos cargados:', Object.keys(productsData).length);
    console.log('🛒 Carrito de compras implementado');
    console.log('❤️ Sección de favoritos implementada');
    console.log('💾 localStorage activado y funcionando');
    console.log('🔄 Sincronización entre pestañas configurada');
    console.log('🎨 Diseño compacto del producto principal');
    console.log('🔄 Click en productos relacionados para cambiar vista principal');
    
    // Exponer función de reset para debugging (opcional)
    window.resetAppStorage = () => appState.resetStorage();
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}