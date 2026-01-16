
/**
 * Product Navigation Handler
 * 
 * AUTOMATIC PRODUCT RECOGNITION GUIDE:
 * To make a new product card work automatically with this unified product page:
 * 1. Wrap the card in a container with class 'tp-product-item-2' or 'tp-product-item'.
 * 2. Ensure it has an ID data attribute: data-id="unique-id" (optional but recommended).
 * 3. Inside the card, ensuring the following elements exist for data extraction:
 *    - Image: <img> inside a .tp-product-thumb-2 or .tp-product-thumb container.
 *    - Title: <a> tag inside .tp-product-title-2 or .tp-product-title (or just h3 a).
 *    - Price: Element with class .new-price (and optionally .old-price).
 *    - Category: <a> tag inside .tp-product-tag-2 or .tp-product-tag.
 * 
 * The script will automatically scrape this data, save it, and navigate to product.html.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Delegate click event to document body to handle existing and dynamically added product cards
    document.body.addEventListener('click', (e) => {
        // Find closest product card wrapper
        // We look for common classes used in the theme: tp-product-item-2, tp-product-item, or any typical wrapper
        const card = e.target.closest('.tp-product-item-2, .tp-product-item, .tp-product-content-2, .tp-product-thumb-2');

        // If no card clicked, ignore
        if (!card) return;

        // Check if the click was on a "prevent navigation" element (Add to Cart, Wishlist, Quick View)
        if (e.target.closest('.tp-product-add-cart-btn, .tp-product-add-to-wishlist-btn, .action-btn, button, .tp-btn')) {
            return;
        }

        // Prevent default navigation if it's a link
        // We want to control the navigation to ensure we capture state
        if (e.target.closest('a')) {
            e.preventDefault();
        }

        // Find the main card container (traverse up if we hit a child like thumb/content)
        const productCard = e.target.closest('.tp-product-item-2') || e.target.closest('.tp-product-item');

        if (!productCard) return;

        // Extract Data
        const productData = {
            id: productCard.getAttribute('data-id') || 'unknown-' + Date.now(),
            title: getText(productCard, '.tp-product-title-2 a, .tp-product-title a, h3 a'),
            price: getText(productCard, '.tp-product-price-2.new-price, .tp-product-price.new-price, .new-price'),
            oldPrice: getText(productCard, '.tp-product-price-2.old-price, .tp-product-price.old-price, .old-price'),
            image: getSrc(productCard, '.tp-product-thumb-2 img, .tp-product-thumb img, img'),
            category: getText(productCard, '.tp-product-tag-2 a, .tp-product-tag a'),
            description: '', // Cards usually don't have descriptions, we'll leave empty or use a default in renderer
            url: 'product.html' // Target URL
        };

        // Fallback for title if empty
        if (!productData.title) productData.title = "اسم المنتج";
        if (!productData.price) productData.price = "0.00 <span>ر.ق</span>";

        // Save to LocalStorage
        localStorage.setItem('ghain_selected_product', JSON.stringify(productData));

        // Navigate
        window.location.href = 'product.html';
    });

    // Helper functions
    function getText(parent, selector) {
        const el = parent.querySelector(selector);
        return el ? el.innerText.trim() : '';
    }

    function getSrc(parent, selector) {
        const el = parent.querySelector(selector);
        return el ? el.src : '';
    }
});
