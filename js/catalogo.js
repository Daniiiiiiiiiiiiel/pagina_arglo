import { productsData } from './data.js';

// ==================== ESTADO DE LA APLICACIÓN ====================
class AppState {
    constructor() {
        this.currentProductId = 0;
        this.cartItems = [];
        this.wishlistItems = [];
        this.cartCount = 0;
        this.wishlistCount = 0;
        this.searchActive = false;
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

// ==================== SISTEMA DE PAGINACIÓN ====================
class ProductPagination {
    constructor() {
        this.currentPage = 0;
        this.itemsPerPage = 20;
        this.allProducts = [];
        this.totalPages = 0;
    }

    setProducts(products, keepCurrentState = false) {
        // ✅ SOLO reiniciar si no hay productos o si se fuerza el reset
        if (!keepCurrentState || this.allProducts.length === 0) {
            this.allProducts = products.filter(p => p.id !== appState.currentProductId);
            this.totalPages = Math.ceil(this.allProducts.length / this.itemsPerPage);
            this.currentPage = 0;
        }
    }

    getCurrentPageProducts() {
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.allProducts.slice(startIndex, endIndex);
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            return true;
        }
        return false;
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            return true;
        }
        return false;
    }

    hasNextPage() {
        return this.currentPage < this.totalPages - 1;
    }

    hasPrevPage() {
        return this.currentPage > 0;
    }

    getPageInfo() {
        return {
            current: this.currentPage + 1,
            total: this.totalPages,
            showing: this.getCurrentPageProducts().length,
            totalProducts: this.allProducts.length
        };
    }
}

// Instancia global de paginación
const productPagination = new ProductPagination();

// ==================== ELEMENTOS DOM ====================
const DOM = {
    // Header
    mainHeader: document.getElementById('mainHeader'),
    searchBtn: document.getElementById('searchBtn'),
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

// ==================== SISTEMA DE BÚSQUEDA ====================

// Crear modal de búsqueda
function createSearchModal() {
    const searchModal = document.createElement('div');
    searchModal.id = 'searchModal';
    searchModal.className = 'search-modal';
    searchModal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <div class="search-input-container">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        id="searchInput" 
                        class="search-input" 
                        placeholder="Buscar productos..."
                        autocomplete="off"
                    >
                    <button class="search-clear" id="searchClear" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <button class="search-close" id="searchClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results" id="searchResults">
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Escribe para buscar productos...</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(searchModal);
    addSearchStyles();
}

// Agregar estilos de búsqueda
function addSearchStyles() {
    if (document.getElementById('search-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'search-styles';
    style.textContent = `
        .search-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .search-modal.active {
            opacity: 1;
            visibility: visible;
        }
        
        .search-modal-content {
            max-width: 900px;
            margin: 80px auto 0;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            transform: translateY(-50px);
            transition: transform 0.3s ease;
        }
        
        .search-modal.active .search-modal-content {
            transform: translateY(0);
        }
        
        .search-modal-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            border-bottom: 2px solid var(--off-white);
        }
        
        .search-input-container {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .search-icon {
            position: absolute;
            left: 1.2rem;
            color: var(--primary-blue);
            font-size: 1.2rem;
        }
        
        .search-input {
            width: 100%;
            padding: 1rem 3.5rem 1rem 3.5rem;
            border: 2px solid var(--light-blue);
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            background: var(--off-white);
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--primary-blue);
            background: white;
            box-shadow: 0 0 0 4px rgba(26, 75, 140, 0.1);
        }
        
        .search-clear {
            position: absolute;
            right: 1rem;
            background: var(--text-light);
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-clear:hover {
            background: var(--logo-red);
            transform: rotate(90deg);
        }
        
        .search-close {
            background: var(--off-white);
            border: none;
            border-radius: 12px;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            color: var(--text-dark);
            font-size: 1.3rem;
        }
        
        .search-close:hover {
            background: var(--logo-red);
            color: white;
            transform: rotate(90deg);
        }
        
        .search-results {
            max-height: calc(100vh - 250px);
            overflow-y: auto;
            padding: 1.5rem;
        }
        
        .search-placeholder {
            text-align: center;
            padding: 3rem;
            color: var(--text-light);
        }
        
        .search-placeholder i {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.3;
        }
        
        .search-results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
        }
        
        .search-result-item {
            background: var(--off-white);
            border-radius: 12px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .search-result-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            border-color: var(--primary-blue);
        }
        
        .search-result-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 0.8rem;
        }
        
        .search-result-title {
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .search-result-price {
            color: var(--primary-blue);
            font-weight: 700;
            font-size: 1.1rem;
        }
        
        .search-result-category {
            font-size: 0.75rem;
            color: var(--text-light);
            margin-bottom: 0.3rem;
        }
        
        .search-no-results {
            text-align: center;
            padding: 3rem;
            color: var(--text-light);
        }
        
        .search-no-results i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.3;
        }
        
        @media (max-width: 768px) {
            .search-modal-content {
                margin: 20px;
                border-radius: 15px;
            }
            
            .search-results-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .search-result-image {
                height: 120px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Buscar productos
function searchProducts(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const allProducts = Object.values(productsData);
    
    return allProducts.filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchTerm);
        const categoryMatch = product.categories.toLowerCase().includes(searchTerm);
        const tagsMatch = product.tags.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description.toLowerCase().includes(searchTerm);
        
        return titleMatch || categoryMatch || tagsMatch || descriptionMatch;
    });
}

// Renderizar resultados de búsqueda
function renderSearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search-minus"></i>
                <p><strong>No se encontraron productos</strong></p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = `
        <div class="search-results-grid">
            ${results.map(product => `
                <div class="search-result-item" data-product-id="${product.id}">
                    <img src="${product.images[0]}" alt="${product.title}" class="search-result-image">
                    <div class="search-result-category">${product.categories.split(',')[0]}</div>
                    <div class="search-result-title">${product.title}</div>
                    <div class="search-result-price">$${product.price}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Agregar eventos a los resultados
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const productId = parseInt(item.dataset.productId);
            closeSearchModal();
            loadProduct(productId, true);
            
            // Scroll al producto
            const productDetail = document.querySelector('.product-detail');
            if (productDetail) {
                const offset = 100;
                const elementPosition = productDetail.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Abrir modal de búsqueda
function openSearchModal() {
    let searchModal = document.getElementById('searchModal');
    if (!searchModal) {
        createSearchModal();
        searchModal = document.getElementById('searchModal');
        initSearchEvents();
    }
    
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    appState.searchActive = true;
    
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 100);
}

// Cerrar modal de búsqueda
function closeSearchModal() {
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        appState.searchActive = false;
        
        // Limpiar búsqueda
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        const searchClear = document.getElementById('searchClear');
        
        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.style.display = 'none';
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Escribe para buscar productos...</p>
                </div>
            `;
        }
    }
}

// Inicializar eventos de búsqueda
function initSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchClose = document.getElementById('searchClose');
    const searchModal = document.getElementById('searchModal');
    
    let searchTimeout;
    
    // Input de búsqueda con debounce
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        if (query.length > 0) {
            searchClear.style.display = 'flex';
        } else {
            searchClear.style.display = 'none';
        }
        
        clearTimeout(searchTimeout);
        
        if (query.trim().length < 2) {
            document.getElementById('searchResults').innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Escribe al menos 2 caracteres...</p>
                </div>
            `;
            return;
        }
        
        searchTimeout = setTimeout(() => {
            const results = searchProducts(query);
            renderSearchResults(results);
        }, 300);
    });
    
    // Limpiar búsqueda
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        document.getElementById('searchResults').innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-search"></i>
                <p>Escribe para buscar productos...</p>
            </div>
        `;
    });
    
    // Cerrar modal
    searchClose.addEventListener('click', closeSearchModal);
    
    // Cerrar al hacer click fuera
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });
}

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
function renderThumbnails() {
    
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
    
    // Reviews (ejemplo estático)
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

// ==================== PRODUCTOS RELACIONADOS CON PAGINACIÓN ====================

// Renderizar productos relacionados con paginación
function renderRelatedProducts(keepCurrentState = false) {
    const allProducts = Object.values(productsData);
    
    // ✅ Pasar el parámetro para mantener el estado actual
    productPagination.setProducts(allProducts, keepCurrentState);
    
    renderCurrentPageProducts();
}

// Renderizar productos de la página actual
function renderCurrentPageProducts() {
    const currentProducts = productPagination.getCurrentPageProducts();
    const pageInfo = productPagination.getPageInfo();
    
    // Renderizar productos con animación de fade
    DOM.relatedProducts.style.opacity = '0';
    DOM.relatedProducts.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        DOM.relatedProducts.innerHTML = currentProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                ${product.oldPrice ? '<div class="sale-badge">SALE!</div>' : ''}
                
                <!-- Botones de acción flotantes -->
                <div class="card-actions">
                    <button class="card-action-btn" data-action="wishlist" data-product-id="${product.id}" title="Añadir a favoritos">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="card-action-btn" data-action="quick-view" data-product-id="${product.id}" title="Vista rápida">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                
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
                        <span class="review-text">(${product.reviews})</span>
                    </div>
                    
                    <div class="card-footer">
                        <div class="card-price">
                            <span class="current-price">$${product.price}</span>
                            ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                        </div>
                        <button class="card-add-btn" data-action="add-cart" data-product-id="${product.id}" title="Añadir al carrito">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Animar aparición
        setTimeout(() => {
            DOM.relatedProducts.style.transition = 'all 0.5s ease';
            DOM.relatedProducts.style.opacity = '1';
            DOM.relatedProducts.style.transform = 'translateY(0)';
        }, 50);
        
        // Renderizar controles de paginación
        renderPaginationControls(pageInfo);
        
        // Inicializar eventos
        initProductCardEvents();
        
        // Scroll suave al inicio de productos
        const relatedSection = document.querySelector('.related-section');
        if (relatedSection) {
            relatedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
}

// Renderizar controles de paginación
function renderPaginationControls(pageInfo) {
    let paginationContainer = document.getElementById('pagination-controls');
    
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-controls';
        paginationContainer.className = 'pagination-controls';
        
        const relatedSection = document.querySelector('.related-section');
        relatedSection.appendChild(paginationContainer);
    }
    
    paginationContainer.innerHTML = `
        <div class="pagination-info">
            <p>Mostrando <strong>${pageInfo.showing}</strong> de <strong>${pageInfo.totalProducts}</strong> productos</p>
            <p class="page-number">Página <strong>${pageInfo.current}</strong> de <strong>${pageInfo.total}</strong></p>
        </div>
        
        <div class="pagination-buttons">
            <button 
                id="prevPageBtn" 
                class="pagination-btn ${!productPagination.hasPrevPage() ? 'disabled' : ''}"
                ${!productPagination.hasPrevPage() ? 'disabled' : ''}
            >
                <i class="fas fa-chevron-left"></i>
                <span>Anterior</span>
            </button>
            
            <div class="pagination-dots">
                ${Array.from({ length: Math.min(pageInfo.total, 10) }, (_, i) => {
                    let pageIndex;
                    if (pageInfo.total <= 10) {
                        pageIndex = i;
                    } else {
                        const currentPage = pageInfo.current - 1;
                        if (currentPage < 5) {
                            pageIndex = i;
                        } else if (currentPage > pageInfo.total - 6) {
                            pageIndex = pageInfo.total - 10 + i;
                        } else {
                            pageIndex = currentPage - 4 + i;
                        }
                    }
                    return `<span class="pagination-dot ${pageIndex === pageInfo.current - 1 ? 'active' : ''}" data-page="${pageIndex}"></span>`;
                }).join('')}
            </div>
            
            <button 
                id="nextPageBtn" 
                class="pagination-btn ${!productPagination.hasNextPage() ? 'disabled' : ''}"
                ${!productPagination.hasNextPage() ? 'disabled' : ''}
            >
                <span>Siguiente</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
    
    addPaginationStyles();
    initPaginationEvents();
}

// Agregar estilos de paginación
function addPaginationStyles() {
    if (document.getElementById('pagination-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pagination-styles';
    style.textContent = `
        .pagination-controls {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            margin-top: 3rem;
            padding: 2.5rem;
            background: linear-gradient(135deg, var(--off-white) 0%, var(--white) 100%);
            border-radius: 20px;
            border: 2px solid rgba(26, 75, 140, 0.08);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }
        
        .pagination-info {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .pagination-info p {
            color: var(--text-light);
            font-size: 0.95rem;
        }
        
        .pagination-info strong {
            color: var(--primary-blue);
            font-weight: 700;
        }
        
        .page-number {
            font-size: 1.1rem !important;
        }
        
        .pagination-buttons {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .pagination-btn {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.8rem 1.8rem;
            background: var(--gradient);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(26, 75, 140, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .pagination-btn:hover:not(.disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(26, 75, 140, 0.4);
        }
        
        .pagination-btn:active:not(.disabled) {
            transform: translateY(-1px);
        }
        
        .pagination-btn.disabled {
            background: var(--text-light);
            cursor: not-allowed;
            opacity: 0.5;
            box-shadow: none;
        }
        
        .pagination-btn i {
            font-size: 0.9rem;
        }
        
        .pagination-dots {
            display: flex;
            gap: 0.6rem;
            align-items: center;
        }
        
        .pagination-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--light-blue);
            border: 2px solid var(--primary-blue);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .pagination-dot:hover {
            transform: scale(1.3);
            background: var(--accent-blue);
        }
        
        .pagination-dot.active {
            background: var(--primary-blue);
            transform: scale(1.4);
            box-shadow: 0 0 0 3px rgba(26, 75, 140, 0.2);
        }
        
        @media (max-width: 768px) {
            .pagination-controls {
                padding: 1.5rem;
                gap: 1.5rem;
            }
            
            .pagination-buttons {
                flex-direction: column;
                gap: 1rem;
            }
            
            .pagination-btn {
                width: 100%;
                justify-content: center;
            }
            
            .pagination-dots {
                order: -1;
            }
            
            .pagination-info p {
                font-size: 0.85rem;
            }
        }
        
        @media (max-width: 576px) {
            .pagination-dot {
                width: 8px;
                height: 8px;
            }
            
            .pagination-dots {
                gap: 0.4rem;
                flex-wrap: wrap;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Inicializar eventos de paginación
function initPaginationEvents() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const dots = document.querySelectorAll('.pagination-dot');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (productPagination.prevPage()) {
                renderCurrentPageProducts();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (productPagination.nextPage()) {
                renderCurrentPageProducts();
            }
        });
    }
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const page = parseInt(dot.dataset.page);
            productPagination.currentPage = page;
            renderCurrentPageProducts();
        });
    });
}

// Cargar producto principal
function loadProduct(productId, keepRelatedProducts = false) {
    const product = productsData[productId];
    if (!product) return;
    
    appState.currentProductId = productId;
    
    // Actualizar información básica
    DOM.productTitle.textContent = product.title;
    DOM.productDescription.textContent = product.description;
    
    // Actualizar precio
    if (product.oldPrice) {
        DOM.productPrice.innerHTML = `${product.price} <span style="font-size: 1.5rem; color: var(--text-light); text-decoration: line-through; margin-left: 0.5rem;">${product.oldPrice}</span>`;
    } else {
        DOM.productPrice.textContent = `${product.price}`;
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
    
    // ✅ Solo recargar productos relacionados si es necesario
    if (!keepRelatedProducts) {
        renderRelatedProducts(true);
    }
    
    // Verificar si está en wishlist
    updateWishlistButton();
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
        // Click en la tarjeta (excepto en botones de acción)
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-action-btn') || e.target.closest('.card-add-btn')) {
                return;
            }
            
            const productId = parseInt(card.dataset.productId);
            
            // ✅ Cargar producto SIN recargar productos relacionados ni hacer scroll arriba
            loadProduct(productId, true);
            
            // Scroll suave solo al área del producto
            const productDetail = document.querySelector('.product-detail');
            if (productDetail) {
                const offset = 100;
                const elementPosition = productDetail.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
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
    
    // Eventos para botones de acción
    document.querySelectorAll('.card-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const productId = parseInt(btn.dataset.productId);
            const product = productsData[productId];
            
            if (action === 'wishlist') {
                toggleWishlistItem(productId, product, btn);
            } else if (action === 'quick-view') {
                loadProduct(productId, true);
                
                // Scroll hacia arriba para ver el producto principal
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Eventos para botón de añadir al carrito
    document.querySelectorAll('.card-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.productId);
            const product = productsData[productId];
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.style.pointerEvents = 'none';
            
            setTimeout(() => {
                addToCart(product, 1, 'Default');
                showNotification('Producto añadido al carrito');
                btn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                btn.style.pointerEvents = 'auto';
            }, 500);
        });
    });
}

// ==================== FUNCIÓN MEJORADA PARA WISHLIST ====================
function toggleWishlistItem(productId, product, btn = null) {
    const existingItemIndex = appState.wishlistItems.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Remover de favoritos
        appState.wishlistItems.splice(existingItemIndex, 1);
        appState.updateWishlistCount();
        appState.saveWishlist();
        updateWishlistView();
        updateWishlistBadge();
        
        if (btn) {
            const icon = btn.querySelector('i');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        
        showNotification('Producto removido de favoritos');
    } else {
        // Añadir a favoritos
        appState.wishlistItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            color: 'Default',
            image: product.images[0]
        });
        appState.updateWishlistCount();
        appState.saveWishlist();
        updateWishlistView();
        updateWishlistBadge();
        
        if (btn) {
            const icon = btn.querySelector('i');
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
        
        showNotification('Producto añadido a favoritos');
        
        // Abrir automáticamente el sidebar de favoritos
        setTimeout(() => {
            DOM.wishlistSidebar.classList.add('active');
            DOM.cartSidebar.classList.remove('active');
        }, 800);
    }
    
    // Actualizar botón de wishlist del producto principal si es necesario
    updateWishlistButton();
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
                    <div class="cart-item-price">${item.price} x ${item.quantity}</div>
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
    
    DOM.cartTotal.textContent = `${total.toFixed(2)}`;
    
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

// ==================== WISHLIST MEJORADO ====================

// Toggle wishlist para producto principal
function toggleWishlist() {
    const product = productsData[appState.currentProductId];
    const color = document.querySelector('.color-option.active').getAttribute('data-color');
    
    const existingItemIndex = appState.wishlistItems.findIndex(item => 
        item.id === product.id && item.color === color
    );
    
    if (existingItemIndex !== -1) {
        // Remover de favoritos
        appState.wishlistItems.splice(existingItemIndex, 1);
        showNotification('Producto removido de favoritos');
    } else {
        // Añadir a favoritos
        appState.wishlistItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            color: color,
            image: product.images[0]
        });
        showNotification('Producto añadido a favoritos');
        
        // Abrir automáticamente el sidebar de favoritos
        setTimeout(() => {
            DOM.wishlistSidebar.classList.add('active');
            DOM.cartSidebar.classList.remove('active');
        }, 800);
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

// Actualizar vista del wishlist - FUNCIÓN MEJORADA
function updateWishlistView() {
    if (appState.wishlistItems.length === 0) {
        DOM.wishlistItemsContainer.innerHTML = `
            <div class="empty-wishlist">
                <i class="far fa-heart"></i>
                <h3>Tu lista de favoritos está vacía</h3>
                <p>Agrega productos que te gusten haciendo clic en el corazón</p>
            </div>
        `;
        return;
    }
    
    DOM.wishlistItemsContainer.innerHTML = appState.wishlistItems.map((item, index) => `
        <div class="wishlist-item" data-product-id="${item.id}">
            <div class="wishlist-item-image">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
            </div>
            <div class="wishlist-item-details">
                <div class="wishlist-item-title">${item.title}</div>
                <div class="wishlist-item-price">$${item.price}</div>
                <div class="wishlist-item-color">Color: ${item.color}</div>
            </div>
            <div class="wishlist-item-actions">
                <button class="wishlist-item-add" data-index="${index}" title="Añadir al carrito">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="wishlist-item-remove" data-index="${index}" title="Eliminar de favoritos">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Agregar estilos para la vista vacía
    addWishlistStyles();
    
    attachWishlistItemEvents();
}

// Agregar estilos para el wishlist
function addWishlistStyles() {
    if (document.getElementById('wishlist-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'wishlist-styles';
    style.textContent = `
        .empty-wishlist {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--text-light);
        }
        
        .empty-wishlist i {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.3;
        }
        
        .empty-wishlist h3 {
            color: var(--text-dark);
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .empty-wishlist p {
            font-size: 0.9rem;
        }
        
        .wishlist-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--off-white);
            border-radius: 12px;
            margin-bottom: 1rem;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .wishlist-item:hover {
            border-color: var(--primary-blue);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .wishlist-item-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
        }
        
        .wishlist-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .wishlist-item-details {
            flex: 1;
            min-width: 0;
        }
        
        .wishlist-item-title {
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .wishlist-item-price {
            color: var(--primary-blue);
            font-weight: 700;
            font-size: 1rem;
            margin-bottom: 0.2rem;
        }
        
        .wishlist-item-color {
            font-size: 0.75rem;
            color: var(--text-light);
        }
        
        .wishlist-item-actions {
            display: flex;
            gap: 0.5rem;
            flex-shrink: 0;
        }
        
        .wishlist-item-add, .wishlist-item-remove {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }
        
        .wishlist-item-add {
            background: var(--primary-blue);
            color: white;
        }
        
        .wishlist-item-add:hover {
            background: var(--accent-blue);
            transform: scale(1.1);
        }
        
        .wishlist-item-remove {
            background: var(--logo-red);
            color: white;
        }
        
        .wishlist-item-remove:hover {
            background: #dc3545;
            transform: scale(1.1);
        }
    `;
    
    document.head.appendChild(style);
}

// Eventos de items del wishlist - FUNCIÓN MEJORADA
function attachWishlistItemEvents() {
    document.querySelectorAll('.wishlist-item-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            const item = appState.wishlistItems[index];
            const product = productsData[item.id];
            
            if (product) {
                addToCart(product, 1, item.color);
                showNotification('Producto añadido al carrito desde favoritos');
                
                // Animación del botón
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.background = 'var(--success-green)';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                    btn.style.background = 'var(--primary-blue)';
                }, 1000);
            }
        });
    });
    
    document.querySelectorAll('.wishlist-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            const item = appState.wishlistItems[index];
            
            // Animación de eliminación
            const wishlistItem = btn.closest('.wishlist-item');
            wishlistItem.style.transform = 'translateX(100%)';
            wishlistItem.style.opacity = '0';
            
            setTimeout(() => {
                appState.wishlistItems.splice(index, 1);
                appState.updateWishlistCount();
                appState.saveWishlist();
                updateWishlistView();
                updateWishlistBadge();
                updateWishlistButton();
                showNotification('Producto removido de favoritos');
            }, 300);
        });
    });
    
    // Click en el item del wishlist para cargar el producto
    document.querySelectorAll('.wishlist-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-item-actions')) {
                return;
            }
            
            const productId = parseInt(item.dataset.productId);
            loadProduct(productId, true);
            
            // Cerrar sidebar y hacer scroll al producto
            DOM.wishlistSidebar.classList.remove('active');
            
            setTimeout(() => {
                const productDetail = document.querySelector('.product-detail');
                if (productDetail) {
                    const offset = 100;
                    const elementPosition = productDetail.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 300);
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

// Botón de búsqueda
DOM.searchBtn.addEventListener('click', openSearchModal);

// Color selector
DOM.colorOptions.forEach((option, index) => {
    option.addEventListener('click', () => {
        DOM.colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        const color = option.getAttribute('data-color');
        DOM.colorName.textContent = color;
        
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
    // Escapar de modales
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
        if (appState.searchActive) {
            closeSearchModal();
        }
    }
    
    // Abrir búsqueda con Ctrl+K o Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
    }
    
    // Solo si no hay modales abiertos
    if (!appState.searchActive && !DOM.imageModal.classList.contains('active') && 
        !DOM.cartSidebar.classList.contains('active') && !DOM.wishlistSidebar.classList.contains('active')) {
        
        if ((e.key === '+' || e.key === '=') && !e.ctrlKey) {
            e.preventDefault();
            DOM.qtyPlus.click();
        }
        
        if ((e.key === '-' || e.key === '_') && !e.ctrlKey) {
            e.preventDefault();
            DOM.qtyMinus.click();
        }
    }
});

// Atajos de teclado para paginación
document.addEventListener('keydown', (e) => {
    if (DOM.imageModal?.classList.contains('active') || 
        DOM.cartSidebar?.classList.contains('active') || 
        DOM.wishlistSidebar?.classList.contains('active') ||
        appState.searchActive) {
        return;
    }
    
    if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') && productPagination.hasNextPage()) {
        e.preventDefault();
        document.getElementById('nextPageBtn')?.click();
    }
    
    if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') && productPagination.hasPrevPage()) {
        e.preventDefault();
        document.getElementById('prevPageBtn')?.click();
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
    if (!appState.isLocalStorageAvailable()) {
        console.warn('localStorage no disponible en este navegador');
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ff6b6b; color: white; padding: 10px; text-align: center; z-index: 10000;';
        notification.textContent = '⚠️ Tu navegador no soporta almacenamiento local. Los datos no se guardarán.';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
    
    appState.loadState();
    setupStorageSync();
    loadProduct(appState.currentProductId);
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
    console.log('📄 Sistema de paginación: 20 productos por página');
    console.log('⌨️ Atajos de teclado:');
    console.log('   - ← → o P/N para navegar páginas');
    console.log('   - Ctrl+K o Cmd+K para abrir búsqueda');
    console.log('   - ESC para cerrar modales');
    console.log('🔍 Sistema de búsqueda implementado');
    console.log('🎯 Botones de acción flotantes en tarjetas');
    console.log('✨ Click en productos NO recarga la página');
    
    window.resetAppStorage = () => appState.resetStorage();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}