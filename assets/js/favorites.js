/**
 * Favorites / Wishlist Feature
 * Handles localStorage persistence, UI updates, and synchronization.
 */

(function () {
    const STORAGE_KEY = 'ghain_favorites';

    // Core Logic
    const Favorites = {
        getAll: () => {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        },

        saveAll: (items) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            Favorites.updateGlobalCount();
            window.dispatchEvent(new CustomEvent("favorites:changed", { detail: { count: items.length } }));
        },

        add: (product) => {
            const items = Favorites.getAll();
            if (!items.find(i => i.id === product.id)) {
                items.push({ ...product, addedAt: Date.now() });
                Favorites.saveAll(items);
            }
        },

        remove: (id) => {
            const items = Favorites.getAll();
            const newItems = items.filter(i => i.id !== id);
            Favorites.saveAll(newItems);
        },

        isFavorite: (id) => {
            const items = Favorites.getAll();
            return items.some(i => i.id === id);
        },

        toggle: (product) => {
            if (Favorites.isFavorite(product.id)) {
                Favorites.remove(product.id);
                return false; // removed
            } else {
                Favorites.add(product);
                return true; // added
            }
        },

        clear: () => {
            Favorites.saveAll([]);
        },

        getCount: () => {
            return Favorites.getAll().length;
        },

        // Helper to generate a stable ID from product data
        generateId: (title, price) => {
            if (!title) return 'unknown-' + Date.now();
            // Slugify title + price
            return (title + '-' + price)
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // Support Arabic chars
                .replace(/^-+|-+$/g, '');
        },

        updateGlobalCount: () => {
            const count = Favorites.getCount();
            const badges = document.querySelectorAll('.wishlist-count-badge, #wishlist-count-badge, #offcanvas-wishlist-badge');
            badges.forEach(b => {
                b.textContent = count;
            });
        },

        // Update all heart icons on the page based on current state
        syncUI: () => {
            // Find all product cards
            document.querySelectorAll('.tp-product-item-2').forEach(card => {
                const productData = Favorites.extractDataFromCard(card);
                if (!productData.id) return;

                // Set data-id on the card/button for easier access if needed
                // Find the wishlist button
                const btn = card.querySelector('.tp-product-add-to-wishlist-btn');
                if (btn) {
                    btn.setAttribute('data-product-id', productData.id);
                    const isFav = Favorites.isFavorite(productData.id);
                    updateHeartIcon(btn, isFav);
                }
            });

            // Also update product details page button if present
            const detailsBtn = document.querySelector('.tp-product-details-action-sm-btn.wishlist-btn');
            if (detailsBtn) {
                // We need to know the product ID for the details page. 
                // It should be passed in or extracted. 
                // For now, let's assume we extract from page.
                const productData = Favorites.extractDataFromPage();
                if (productData.id) {
                    detailsBtn.setAttribute('data-product-id', productData.id);
                    const isFav = Favorites.isFavorite(productData.id);
                    updateHeartIconText(detailsBtn, isFav);
                }
            }
        },

        // Extract data from card DOM
        extractDataFromCard: (card) => {
            // Support both tp-product-title-2 and tp-product-title (for different sections)
            const titleEl = card.querySelector('.tp-product-title-2 a') ||
                card.querySelector('.tp-product-title a') ||
                card.querySelector('.tp-product-title-2') ||
                card.querySelector('.tp-product-title');

            // Support both tp-product-price-2 and tp-product-price
            const priceEl = card.querySelector('.tp-product-price-2.new-price') ||
                card.querySelector('.tp-product-price.new-price') ||
                card.querySelector('.tp-product-price-2') ||
                card.querySelector('.tp-product-price');

            // Support both tp-product-thumb-2 and tp-product-thumb
            const imgEl = card.querySelector('.tp-product-thumb-2 img') ||
                card.querySelector('.tp-product-thumb img');

            const title = titleEl ? titleEl.textContent.trim() : '';
            const price = priceEl ? priceEl.textContent.trim() : '';
            const image = imgEl ? imgEl.src : '';

            // Check if card has data-id attribute
            let id = card.getAttribute('data-id');
            if (!id) {
                id = Favorites.generateId(title, price);
            }

            return { id, title, price, image };
        },

        // Extract data from Product Details Page DOM
        extractDataFromPage: () => {
            const titleEl = document.getElementById('product-title');
            const priceEl = document.getElementById('product-price-new');
            const imgEl = document.getElementById('product-image-main');

            const title = titleEl ? titleEl.textContent.trim() : '';
            const price = priceEl ? priceEl.textContent.trim() : '';
            const image = imgEl ? imgEl.src : '';

            // Try to get ID from URL query param first
            let id = new URLSearchParams(window.location.search).get('id');
            if (!id) {
                // Try to fallback to localStorage selected product if titles match
                const stored = localStorage.getItem('ghain_selected_product');
                if (stored) {
                    try {
                        const p = JSON.parse(stored);
                        if (p.title === title) {
                            id = p.id;
                        }
                    } catch (e) { }
                }
            }
            if (!id) {
                id = Favorites.generateId(title, price);
            }

            return { id, title, price, image };
        },
    };

    // Helper to toggle icon appearance
    function updateHeartIcon(btn, isActive) {
        // Check for FontAwesome icon (<i> element)
        const icon = btn.querySelector('i');
        // Check for SVG icon
        const svg = btn.querySelector('svg');
        const svgPath = svg ? svg.querySelector('path') : null;

        if (isActive) {
            btn.classList.add('active'); // General active class

            // Force Theme Primary Color with Priority
            btn.style.setProperty('color', 'var(--tp-theme-primary)', 'important');
            btn.style.setProperty('border-color', 'var(--tp-theme-primary)', 'important');

            // Handle FontAwesome icon
            if (icon) {
                icon.style.setProperty('color', 'var(--tp-theme-primary)', 'important');

                if (icon.classList.contains('fa-regular')) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else if (icon.classList.contains('flaticon-heart')) {
                    icon.className = 'fa-solid fa-heart';
                }
            }

            // Handle SVG icon
            if (svgPath) {
                svgPath.setAttribute('fill', 'var(--tp-theme-primary)');
                svgPath.setAttribute('stroke', 'var(--tp-theme-primary)');
                svgPath.style.setProperty('fill', 'var(--tp-theme-primary)', 'important');
                svgPath.style.setProperty('stroke', 'var(--tp-theme-primary)', 'important');
            }
        } else {
            btn.classList.remove('active');

            // Revert Colors
            btn.style.setProperty('color', '');
            btn.style.setProperty('border-color', '');

            // Revert FontAwesome icon
            if (icon) {
                icon.style.setProperty('color', '');
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                if (!icon.classList.contains('fa-heart')) icon.classList.add('fa-heart');
            }

            // Revert SVG icon
            if (svgPath) {
                svgPath.setAttribute('fill', 'none');
                svgPath.setAttribute('stroke', 'currentColor');
                svgPath.style.fill = '';
                svgPath.style.stroke = '';
            }
        }
    }

    function updateHeartIconText(btn, isActive) {
        // For product details page button which has text and SVG
        const textNode = Array.from(btn.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length > 0);
        const svgPath = btn.querySelector('svg path');

        if (isActive) {
            btn.classList.add('active');

            // Force Theme Primary Color
            btn.style.setProperty('color', 'var(--tp-theme-primary)', 'important');
            btn.style.setProperty('border-color', 'var(--tp-theme-primary)', 'important');

            if (textNode) textNode.textContent = ' Saved';

            if (svgPath) {
                svgPath.setAttribute('fill', 'var(--tp-theme-primary)');
                svgPath.setAttribute('stroke', 'var(--tp-theme-primary)');
                // Ensure style priority overrides any CSS
                svgPath.style.setProperty('fill', 'var(--tp-theme-primary)', 'important');
                svgPath.style.setProperty('stroke', 'var(--tp-theme-primary)', 'important');
            }
        } else {
            btn.classList.remove('active');

            // Revert
            btn.style.setProperty('color', '');
            btn.style.setProperty('border-color', '');

            if (textNode) textNode.textContent = ' Add Wishlist';

            if (svgPath) {
                svgPath.setAttribute('fill', 'none');
                svgPath.setAttribute('stroke', 'currentColor');
                svgPath.style.fill = '';
                svgPath.style.stroke = '';
            }
        }
    }

    // Expose Global
    window.Favorites = Favorites;

    // Favorites Rendering Logic
    Favorites.renderWishlist = () => {
        const container = document.getElementById('wishlist-container');
        if (!container) return;

        const items = Favorites.getAll();
        const emptyState = document.getElementById('wishlist-empty');
        const actions = document.getElementById('wishlist-actions');

        container.innerHTML = '';

        if (items.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (actions) actions.classList.add('d-none');
            return;
        } else {
            if (emptyState) emptyState.style.display = 'none';
            if (actions) actions.classList.remove('d-none');
        }

        items.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-6';

            // Build Card HTML - Reusing tp-product-item-2 styles
            col.innerHTML = `
               <div class="tp-product-item-2 mb-40" data-id="${product.id}">
                  <div class="tp-product-thumb-2 p-relative z-index-1 fix w-img">
                     <a href="product.html?id=${product.id}" class="product-link" data-id="${product.id}">
                        <img src="${product.image}" alt="${product.title}">
                     </a>
                     <div class="tp-product-action-2 tp-product-action-blackStyle">
                        <div class="tp-product-action-item-2 d-flex flex-column">
                           <button type="button" class="tp-product-action-btn-2 tp-product-add-cart-btn" data-id="${product.id}">
                              <i class="fa-solid fa-cart-shopping"></i>
                              <span class="tp-product-tooltip tp-product-tooltip-right">إضافة للسلة</span>
                           </button>
                           <button type="button" class="tp-product-action-btn-2 tp-product-remove-wishlist-btn" data-id="${product.id}">
                              <i class="fa-solid fa-trash"></i>
                              <span class="tp-product-tooltip tp-product-tooltip-right">إزالة</span>
                           </button>
                        </div>
                     </div>
                  </div>
                  <div class="tp-product-content-2 pt-15">
                     <h3 class="tp-product-title-2">
                        <a href="product.html?id=${product.id}" class="product-link" data-id="${product.id}">${product.title}</a>
                     </h3>
                     <div class="tp-product-price-wrapper-2">
                        <span class="tp-product-price-2 new-price">${product.price}</span>
                     </div>
                  </div>
               </div>
            `;

            container.appendChild(col);
        });

        // Add listeners for removal
        container.querySelectorAll('.tp-product-remove-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                // Confirm? 
                // Removed immediately for better UX, or confirm.
                Favorites.remove(id);
                Favorites.renderWishlist(); // Re-render
            });
        });

        // Add listeners for product links to store selection
        container.querySelectorAll('.product-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // We need to set the product in localStorage to be read by product.html
                const id = link.getAttribute('data-id');
                const item = items.find(i => i.id === id);
                if (item) {
                    localStorage.setItem('ghain_selected_product', JSON.stringify(item));
                }
            });
        });

        // Clear all button
        const clearBtn = document.getElementById('clear-wishlist-btn');
        if (clearBtn) {
            // Remove previous listener to avoid duplicates if re-init
            const newBtn = clearBtn.cloneNode(true);
            clearBtn.parentNode.replaceChild(newBtn, clearBtn);
            newBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من مسح القائمة المفضلة؟')) {
                    Favorites.clear();
                    Favorites.renderWishlist();
                }
            });
        }

        // Sync Cart Icons
        if (window.CartManager && window.CartManager.syncGlobalUI) {
            window.CartManager.syncGlobalUI();
        }
    };

    // Initialization
    function init() {
        Favorites.updateGlobalCount();
        Favorites.renderWishlist();

        // Delay slighty to ensure DOM elements (like sliders) are ready
        setTimeout(Favorites.syncUI, 500);

        // Event Delegation for clicks (Use Capture to beat Swiper/Sliders)
        document.body.addEventListener('click', (e) => {
            // Check for Wishlist Button click
            const btn = e.target.closest('.tp-product-add-to-wishlist-btn');
            if (btn) {
                console.log('Wishlist clicked (Capture Mode)');
                e.preventDefault();
                e.stopPropagation();

                const card = btn.closest('.tp-product-item-2');
                if (card) {
                    const product = Favorites.extractDataFromCard(card);
                    if (product.id) {
                        const isNowFav = Favorites.toggle(product);

                        // Update ALL wishlist buttons in this card (handles duplicates)
                        const allWishlistBtns = card.querySelectorAll('.tp-product-add-to-wishlist-btn');
                        allWishlistBtns.forEach(wishlistBtn => {
                            updateHeartIcon(wishlistBtn, isNowFav);
                        });

                        // Animation / Toast could go here
                    }
                }
                return;
            }

            // Check for Details Page Wishlist Button
            const detailsBtn = e.target.closest('.wishlist-btn'); // specific class we will add
            if (detailsBtn) {
                e.preventDefault();
                const product = Favorites.extractDataFromPage();
                if (product.id) {
                    const isNowFav = Favorites.toggle(product);
                    updateHeartIconText(detailsBtn, isNowFav);
                }
            }
        }, true);

        // Listen for sync events (e.g. from other tabs or components)
        window.addEventListener('favorites:changed', () => {
            Favorites.updateGlobalCount();
            Favorites.syncUI();
            Favorites.renderWishlist();
        });

        // Listen for storage events (other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                Favorites.updateGlobalCount();
                Favorites.syncUI();
                Favorites.renderWishlist();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
