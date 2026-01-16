(function ($) {
    "use strict";

    // Define paths for header and footer
    // Add timestamp to force reload (Cache busting)
    var ts = new Date().getTime();
    var headerUrl = 'assets/includes/header.html?v=' + ts;
    var footerUrl = 'assets/includes/footer.html?v=' + ts;

    // Function to load HTML content via AJAX
    function loadComponent(selector, url) {
        return $.ajax({
            url: url,
            method: 'GET',
            dataType: 'html'
        }).done(function (data) {
            $(selector).html(data);
        }).fail(function () {
            console.error("Error loading component from " + url);
        });
    }

    $(document).ready(function () {
        // Load Header and Footer
        $.when(
            loadComponent('#global-header', headerUrl),
            loadComponent('#global-footer', footerUrl)
        ).always(function () {
            // Set active menu item based on current URL
            var path = window.location.pathname;
            var page = path.split("/").pop();
            if (page === "" || page === "/") page = "index.html";

            // Wait a moment for DOM to settle if needed, but synchronous after html() is fine.
            $('.main-menu nav ul li a').each(function () {
                var href = $(this).attr('href');
                if (href === page) {
                    $(this).parent('li').addClass('active');
                    $(this).closest('.has-dropdown').addClass('active');
                }
            });

            // After injection, dynamically load main.js
            // This ensures main.js finds the new DOM elements (like navigation, mobile menu, etc.)


            // Remove any static main.js if present (prevent double execution)
            $('script[src*="assets/js/main.js"]').remove();

            console.log('Attempting to inject main.js...');
            var script = document.createElement('script');
            script.src = 'assets/js/main.js?v=' + new Date().getTime();
            script.onload = function () {
                // Initialize specific plugins if needed, or trigger window load
                if (document.readyState === 'complete') {
                    $(window).trigger('load');
                }
            };
            document.body.appendChild(script);

            // Load Product Navigator (Global)
            var navScript = document.createElement('script');
            navScript.src = 'assets/js/product-navigator.js?v=' + new Date().getTime();
            document.body.appendChild(navScript);

            // Load Product Renderer (Only on product page)
            if (page.includes('product.html') || page.includes('product.html')) {
                var renderScript = document.createElement('script');
                renderScript.src = 'assets/js/product-renderer.js?v=' + new Date().getTime();
                document.body.appendChild(renderScript);
            }

            // Sync Favorites UI (Badge in Header)
            if (window.Favorites) {
                setTimeout(function () {
                    window.Favorites.updateGlobalCount();
                    window.Favorites.syncUI();
                }, 100);
            }


            // Failsafe: Remove Preloader
            setTimeout(function () {
                $('#loading').fadeOut(500, function () {
                    $(this).remove();
                });
            }, 1000); // Wait 1s max for things to settle
        });
    });

})(jQuery);
