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
    if (product) {
        // 2. Render Product Details
        renderProductDetails(product);
    } else {
        console.error("Product not found: " + targetId);
    }

    // 3. Setup Event Listeners (Run regardless of product finding to keep UI interactive)
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

    // Quantity Logic (Handle all instances, e.g. Main and QuickView)
    // We assume the plus/minus buttons are siblings of the input or in the same container
    const quantityContainers = document.querySelectorAll('.tp-product-quantity');

    quantityContainers.forEach(container => {
        const minusBtn = container.querySelector('.tp-cart-minus');
        const plusBtn = container.querySelector('.tp-cart-plus');
        const input = container.querySelector('.tp-cart-input');

        if (plusBtn && input) {
            // Clone to remove old listeners if any (though unlikely if re-injected)
            const newPlus = plusBtn.cloneNode(true);
            plusBtn.parentNode.replaceChild(newPlus, plusBtn);

            newPlus.addEventListener('click', () => {
                let val = parseInt(input.value) || 1;
                console.log('Plus clicked. Old:', input.value, 'New:', val + 1);
                input.value = val + 1;
            });
        }

        if (minusBtn && input) {
            const newMinus = minusBtn.cloneNode(true);
            minusBtn.parentNode.replaceChild(newMinus, minusBtn);

            newMinus.addEventListener('click', () => {
                let val = parseInt(input.value) || 1;
                if (val > 1) input.value = val - 1;
            });
        }
    });

    // Buy Now Logic - Handle Multiple Buttons
    buyNowBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Find the quantity input associated with THIS button's context
            let qty = 1;

            // Scenario A: Button is inside a wrapper that also has the quantity input (unlikely in this layout but possible)
            const wrapper = btn.closest('.tp-product-details-action-wrapper');
            if (wrapper) {
                const input = wrapper.querySelector('.tp-cart-input');
                if (input) qty = parseInt(input.value) || 1;
            } else {
                // Scenario B: Fallback to the first main input found
                const mainInput = document.querySelector('.tp-cart-input');
                if (mainInput) qty = parseInt(mainInput.value) || 1;
            }

            console.log(`Buy Now Clicked. ID: ${productId}, Qty: ${qty}`);

            // Redirect to checkout with product ID and quantity
            window.location.href = `checkout.html?id=${productId}&qty=${qty}`;
        });
    });

    // Add To Cart Logic
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Similar logic for getting quantity can be added here
            alert('تمت إضافة المنتج إلى السلة');
        });
    });
}
