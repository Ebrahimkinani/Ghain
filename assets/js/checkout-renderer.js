/**
 * Checkout Renderer Script
 * Handles dynamic rendering of the checkout order summary based on URL parameters.
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Get Params
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const qty = parseInt(urlParams.get('qty')) || 1;

    // 2. Locate Elements
    const productListContainer = document.querySelector('.tp-order-info-list ul');
    const subtotalEl = document.querySelector('.tp-order-info-list-subtotal span:last-child');
    const totalEl = document.querySelector('.tp-order-info-list-total span:last-child');

    // If no product ID, we assume standard cart flow (future implementation) 
    // or just leave the static/default content if it's a direct visit without params.
    // For this task, we specifically handle the "Direct Buy" flow.
    if (!productId) {
        return;
    }

    if (typeof productsData === 'undefined') {
        console.error("productsData is not defined.");
        return;
    }

    const product = getProductById(productId);
    if (!product) {
        console.error("Product not found");
        return;
    }

    // 3. Render Order Summary
    renderOrderSummary(product, qty, productListContainer, subtotalEl, totalEl);
});


function renderOrderSummary(product, qty, listContainer, subtotalEl, totalEl) {
    if (!listContainer) return;

    // Clear existing static items (except header/footer parts if they are in the same list)
    // The HTML structure has <li> items. We want to keep the header, remove the product <li>s, and keep subtotal/total.
    // Given the structure in checkout.html, it's a single <ul> with different class names for items.

    // Strategy: Rebuild the innerHTML of the <ul> to be safe and clean.

    // Parse price
    const priceStr = product.price.replace(/[^\d.]/g, '');
    const price = parseFloat(priceStr) || 0;
    const subtotal = price * qty;

    // Shipping cost (Logic from HTML: Flat rate $20, Local $25, Free)
    // For now, let's default to a simple calculation or just show the subtotal. 
    // The HTML has radio buttons for shipping. We should likely listen to them to update total.
    // For this specific request, we'll set the initial values.

    const shippingCost = 20; // Default flat rate based on HTML checked state? HTML doesn't have checked by default. Let's assume 0 or 20.
    // Actually, let's look at the HTML: <input id="flat_rate" type="radio" name="shipping">

    const formattedSubtotal = `$${subtotal.toFixed(2)}`;
    const formattedTotal = `$${(subtotal + shippingCost).toFixed(2)}`;

    // We need to preserve the structure. 
    // Let's find the product items. They are <li class="tp-order-info-list-desc">.
    const existingItems = listContainer.querySelectorAll('.tp-order-info-list-desc');
    existingItems.forEach(el => el.remove());

    // Create new item
    const newItem = document.createElement('li');
    newItem.className = 'tp-order-info-list-desc';
    newItem.innerHTML = `
        <p>${product.title} <span> x ${qty}</span></p>
        <span>$${(price * qty).toFixed(2)}</span>
    `;

    // Insert after header
    const header = listContainer.querySelector('.tp-order-info-list-header');
    if (header) {
        header.after(newItem);
    } else {
        listContainer.prepend(newItem);
    }

    // Update Subtotal/Total Text
    if (subtotalEl) subtotalEl.textContent = formattedSubtotal;
    if (totalEl) totalEl.textContent = formattedTotal;

    // Helper: Update total when shipping changes
    const shippingInputs = document.querySelectorAll('input[name="shipping"]');
    shippingInputs.forEach(input => {
        input.addEventListener('change', () => {
            let shipPrice = 0;
            if (input.id === 'flat_rate') shipPrice = 20;
            else if (input.id === 'local_pickup') shipPrice = 25;

            if (totalEl) {
                totalEl.textContent = `$${(subtotal + shipPrice).toFixed(2)}`;
            }
        });
    });

    // Auto-select flat rate matching our default calc if needed
    // document.getElementById('flat_rate').checked = true; 
}
