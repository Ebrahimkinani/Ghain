/**
 * Scroll Animation Handler
 * Adds fade-in animations to sections as they come into view
 */

(function () {
    'use strict';

    // Configuration
    const config = {
        threshold: 0.15, // Percentage of element visible before animation triggers
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully visible
    };

    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the animate-in class when element is in view
                entry.target.classList.add('animate-in');

                // Optional: Stop observing after animation (one-time animation)
                // Uncomment the line below if you want animation to happen only once
                // observer.unobserve(entry.target);
            } else {
                // Optional: Remove class when element leaves viewport
                // This allows re-animation when scrolling back up
                // Comment out the line below if you want one-time animation
                entry.target.classList.remove('animate-in');
            }
        });
    }, config);

    // Initialize animations when DOM is ready
    function initScrollAnimations() {
        // Select all elements with scroll animation classes
        const animatedElements = document.querySelectorAll(
            '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale'
        );

        // Observe each element
        animatedElements.forEach(element => {
            observer.observe(element);
        });

        console.log(`Scroll animations initialized for ${animatedElements.length} elements`);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    // Expose function globally for manual initialization if needed
    window.initScrollAnimations = initScrollAnimations;

})();
