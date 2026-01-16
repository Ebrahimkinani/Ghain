/**
 * Product Renderer Script
 * Handles dynamic rendering of the product details page and "Buy Now" functionality.
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Get Params
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Default to first product if no ID is present (for demo purposes)
    const targetId = productId || '1';

    if (typeof productsData === 'undefined') {
        console.error("productsData is not defined.");
        return;
    }

    const product = getProductById(targetId);
    if (!product) {
        console.error("Product not found");
        // Optionally redirect to 404 or show error
        return;
    }

    // 2. Render Product Details
    renderProductDetails(product);

    // 3. Setup Event Listeners
    setupEventListeners(targetId);
});

function renderProductDetails(product) {
    // Basic elements
    const titleEl = document.getElementById('product-title');
    const categoryEl = document.getElementById('product-category');
    const descEl = document.getElementById('product-desc');
    const priceNewEl = document.getElementById('product-price-new');
    const priceOldEl = document.getElementById('product-price-old');

    // Breadcrumb
    const breadcrumbProductEl = document.getElementById('breadcrumb-product');

    // Images
    const mainImage = document.getElementById('product-image-main');
    const thumb1 = document.getElementById('product-thumb-1');
    const thumb2 = document.getElementById('product-thumb-2');
    const mainImage2 = document.getElementById('product-image-main-2');


    if (titleEl) titleEl.textContent = product.title;
    if (categoryEl) categoryEl.textContent = product.category;
    if (descEl) descEl.textContent = product.description;
    if (priceNewEl) priceNewEl.textContent = `${product.price} ر.ق`;
    if (priceOldEl) priceOldEl.textContent = `${product.oldPrice} ر.ق`;
    if (breadcrumbProductEl) breadcrumbProductEl.textContent = product.title;

    if (mainImage) mainImage.src = product.image;

    // Handle gallery if available
    if (product.images && product.images.length > 0) {
        if (thumb1) thumb1.src = product.images[0];
        if (mainImage) mainImage.src = product.images[0]; // Ensure main image matches first thumb

        if (product.images.length > 1) {
            if (thumb2) thumb2.src = product.images[1];
            if (mainImage2) mainImage2.src = product.images[1];
        }
    }
}

function setupEventListeners(productId) {
    const buyNowBtns = document.querySelectorAll('.tp-product-details-buy-now-btn');
    const addToCartBtns = document.querySelectorAll('.tp-product-details-add-to-cart-btn');
    const qtyInput = document.querySelector('.tp-cart-input');
    const plusBtn = document.querySelector('.tp-cart-plus');
    const minusBtn = document.querySelector('.tp-cart-minus');

    // Quantity Logic (keep single for now as it targets the main product page input)
    // Note: If QuickView has its own quantity input, we'd need to scope this better.
    if (plusBtn && qtyInput) {
        plusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            qtyInput.value = val + 1;
        });
    }

    if (minusBtn && qtyInput) {
        minusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
    }

    // Buy Now Logic - Handle Multiple Buttons
    buyNowBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Try to find a quantity input relative to this button or default to the main one
            // specific to the container of the button if possible, else fallback
            const specificQtyInput = btn.closest('.tp-product-details-action-wrapper')?.querySelector('.tp-cart-input');
            const finalQtyInput = specificQtyInput || qtyInput;
            const qty = finalQtyInput ? finalQtyInput.value : 1;

            console.log(`Buy Now Clicked. ID: ${productId}, Qty: ${qty}`);

            // Redirect to checkout with product ID and quantity
            window.location.href = `checkout.html?id=${productId}&qty=${qty}`;
        });
    });

    // Add To Cart Logic
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('تمت إضافة المنتج إلى السلة');
        });
    });
}
