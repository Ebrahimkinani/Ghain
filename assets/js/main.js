// Expose CartManager Globally
window.CartManager = CartManager;

////////////////////////////////////////////////////
// 22. Ghain Cart Manager
var CartManager = {
	key: 'ghain_cart',
	getCart: function () {
		var cart = localStorage.getItem(this.key);
		return cart ? JSON.parse(cart) : [];
	},
	isInCart: function (id) {
		var cart = this.getCart();
		return cart.some(item => item.id == id);
	},
	saveCart: function (cart) {
		localStorage.setItem(this.key, JSON.stringify(cart));
		this.updateBadge();
		this.syncGlobalUI(); // Update buttons on save
		$(window).trigger('cartUpdated', [cart]);
	},
	addItem: function (product) {
		var cart = this.getCart();
		var existingItem = cart.find(item => item.id === product.id);

		if (existingItem) {
			existingItem.quantity += parseInt(product.quantity);
		} else {
			cart.push({
				id: product.id,
				title: product.title,
				price: parseFloat(product.price),
				image: product.image,
				quantity: parseInt(product.quantity)
			});
		}
		this.saveCart(cart);
		// Optional: Show success notification?
		alert('تم إضافة المنتج للسلة بنجاح!');
	},
	removeItem: function (id) {
		var cart = this.getCart();
		var updatedCart = cart.filter(item => item.id !== id);
		this.saveCart(updatedCart);
		this.renderCartPage();
	},
	updateQuantity: function (id, quantity) {
		var cart = this.getCart();
		var item = cart.find(item => item.id === id);
		if (item) {
			item.quantity = parseInt(quantity);
			if (item.quantity <= 0) {
				this.removeItem(id);
				return;
			}
			this.saveCart(cart);
			this.renderCartPage();
		}
	},
	getTotals: function () {
		var cart = this.getCart();
		return {
			count: cart.reduce((total, item) => total + item.quantity, 0),
			total: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
		};
	},
	updateBadge: function () {
		var totals = this.getTotals();
		$('#cart-count-badge').text(totals.count);
		$('#offcanvas-cart-badge').text(totals.count);
	},
	syncGlobalUI: function () {
		var cart = this.getCart();
		// Find all add-to-cart buttons
		$('.tp-product-add-cart-btn').each(function () {
			var btn = $(this);
			var card = btn.closest('.tp-product-item-2, .tp-product-item');
			var id = card.attr('data-id') || card.data('id') || btn.attr('data-id') || btn.data('id');

			// Try to find ID from link if not on element
			if (!id) {
				var link = card.find('.tp-product-title-2 a, .tp-product-title a').attr('href');
				if (link && link.includes('id=')) {
					id = link.split('id=')[1];
				}
			}

			if (id && cart.some(item => item.id == id)) {
				// Item is in cart -> Show Remove Icon
				btn.addClass('in-cart');
				btn.find('i').removeClass('fa-cart-shopping').addClass('fa-trash'); // or fa-minus-circle
				btn.find('.tp-product-tooltip').text('إزالة من السلة');
			} else {
				// Item not in cart -> Show Add Icon
				btn.removeClass('in-cart');
				btn.find('i').removeClass('fa-trash').addClass('fa-cart-shopping');
				btn.find('.tp-product-tooltip').text('إضافة للسلة');
			}
		});

		// Sync Product Details Page Button
		if ($('.tp-product-details-add-to-cart-btn').length > 0) {
			var urlParams = new URLSearchParams(window.location.search);
			var productId = urlParams.get('id');
			var detailsBtn = $('.tp-product-details-add-to-cart-btn');

			if (productId && cart.some(item => item.id == productId)) {
				detailsBtn.text('إزالة من السلة');
			} else {
				detailsBtn.text('إضافة للسلة');
			}
		}
	},
	clearCart: function () {
		localStorage.removeItem(this.key);
		this.updateBadge();
		this.renderCartPage();
		this.syncGlobalUI();
	},
	renderCartPage: function () {
		if ($('.tp-cart-list').length === 0) return;

		var cart = this.getCart();
		var tbody = $('.tp-cart-list table tbody');
		tbody.empty();

		if (cart.length === 0) {
			tbody.append('<tr><td colspan="6" class="text-center">السلة فارغة</td></tr>');
			$('.tp-cart-checkout-top-price, .tp-cart-checkout-total span:last-child').text('$0.00');
			return;
		}

		cart.forEach(item => {
			var total = item.price * item.quantity;
			var row = `
					<tr data-id="${item.id}">
						<td class="tp-cart-img"><a href="product.html?id=${item.id}"> <img src="${item.image}" alt=""></a></td>
						<td class="tp-cart-title"><a href="product.html?id=${item.id}">${item.title}</a></td>
						<td class="tp-cart-price"><span>$${item.price.toFixed(2)}</span></td>
						<td class="tp-cart-quantity">
							<div class="tp-product-quantity mt-10 mb-10">
								<span class="tp-cart-minus">
									<svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M1 1H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</span>
								<input class="tp-cart-input" type="text" value="${item.quantity}" readonly>
								<span class="tp-cart-plus">
									<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M5 1V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
										<path d="M1 5H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</span>
							</div>
						</td>
						<td class="tp-cart-action">
							<button class="tp-cart-action-btn remove-item-btn">
								<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd" clip-rule="evenodd" d="M9.53033 1.53033C9.82322 1.23744 9.82322 0.762563 9.53033 0.46967C9.23744 0.176777 8.76256 0.176777 8.46967 0.46967L5 3.93934L1.53033 0.46967C1.23744 0.176777 0.762563 0.176777 0.46967 0.46967C0.176777 0.762563 0.176777 1.23744 0.46967 1.53033L3.93934 5L0.46967 8.46967C0.176777 8.76256 0.176777 9.23744 0.46967 9.53033C0.762563 9.82322 1.23744 9.82322 1.53033 9.53033L5 6.06066L8.46967 9.53033C8.76256 9.82322 9.23744 9.82322 9.53033 9.53033C9.82322 9.23744 9.82322 8.76256 9.53033 8.46967L6.06066 5L9.53033 1.53033Z" fill="currentColor" />
								</svg>
								<span>إزالة</span>
							</button>
						</td>
					</tr>
				`;
			tbody.append(row);
		});

		// Update totals
		var totals = this.getTotals();
		$('.tp-cart-checkout-top-price').text('$' + totals.total.toFixed(2));
		$('.tp-cart-checkout-total span:last-child').text('$' + totals.total.toFixed(2));
	}
};
// Expose globally
window.CartManager = CartManager;

// Initialize Cart on Load
$(document).ready(function () {
	CartManager.updateBadge();
	CartManager.renderCartPage();
	CartManager.syncGlobalUI(); // Sync on load

	// Event Listener: Add/Remove Toggle (Product Details)
	$('.tp-product-details-add-to-cart-btn').on('click', function (e) {
		e.preventDefault();
		var btn = $(this);
		var wrapper = $('.tp-product-details-wrapper');
		var title = wrapper.find('.tp-product-details-title').text().trim();
		var priceText = wrapper.find('.new-price').text().trim().replace('$', '');
		var price = parseFloat(priceText) || 0;
		// Get ID from URL
		var urlParams = new URLSearchParams(window.location.search);
		var id = urlParams.get('id') || 'prod_' + Math.floor(Math.random() * 1000);
		var quantity = parseInt($('.tp-product-details-quantity input').val()) || 1;
		// Image: find active main image
		var image = $('.tp-product-details-nav-main-thumb img').attr('src');

		// Toggle: Check if item is already in cart
		if (CartManager.isInCart(id)) {
			CartManager.removeItem(String(id));
			// Update button text
			btn.text('إضافة للسلة');
		} else {
			CartManager.addItem({
				id: id,
				title: title,
				price: price,
				image: image,
				quantity: quantity
			});
			// Update button text
			btn.text('إزالة من السلة');
		}
	});

	// Event Listener: Add/Remove Toggle (Related Products / Shop Page / Favorites)
	$(document).off('click', '.tp-product-add-cart-btn').on('click', '.tp-product-add-cart-btn', function (e) {
		e.preventDefault();
		var btn = $(this);
		var card = btn.closest('.tp-product-item-2, .tp-product-item');
		var title = card.find('.tp-product-title-2 a, .tp-product-title a').text().trim();
		var priceText = card.find('.new-price').text().trim().replace('$', '');
		var price = parseFloat(priceText) || 0;
		var link = card.find('.tp-product-title-2 a, .tp-product-title a').attr('href');
		var image = card.find('.tp-product-thumb-2 img, .tp-product-thumb img').attr('src');

		var id = card.attr('data-id') || card.data('id') || btn.attr('data-id') || btn.data('id');

		// Try fallback if no ID found
		if (!id && link && link.includes('id=')) {
			id = link.split('id=')[1];
		}
		if (!id) {
			id = 'prod_' + Math.floor(Math.random() * 1000);
		}

		if (CartManager.isInCart(id)) {
			CartManager.removeItem(String(id));
		} else {
			CartManager.addItem({
				id: id,
				title: title,
				price: price,
				image: image,
				quantity: 1
			});
		}
	});

	// Cart Page Events (Delegated)
	// Remove Item
	$(document).on('click', '.remove-item-btn', function () {
		var id = $(this).closest('tr').data('id');
		CartManager.removeItem(String(id)); // ID stored as string in DOM
	});

	// Quantity Plus
	$(document).on('click', '.tp-cart-plus', function () {
		var row = $(this).closest('tr');
		var id = row.data('id');
		var input = row.find('input');
		var newVal = parseInt(input.val()) + 1;
		input.val(newVal);
		CartManager.updateQuantity(String(id), newVal);
	});

	// Quantity Minus
	$(document).on('click', '.tp-cart-minus', function () {
		var row = $(this).closest('tr');
		var id = row.data('id');
		var input = row.find('input');
		var newVal = parseInt(input.val()) - 1;
		if (newVal >= 1) {
			input.val(newVal);
			CartManager.updateQuantity(String(id), newVal);
		}
	});

	////////////////////////////////////////////////////
	// Theme Global Initialization

	// 01. PreLoader
	$('#loading').fadeOut(500);

	// 02. Data Background
	$("[data-background]").each(function () {
		$(this).css("background-image", "url(" + $(this).attr("data-background") + ")")
	});

	// 02b. Data Background Color
	$("[data-bg-color]").each(function () {
		$(this).css("background-color", $(this).attr("data-bg-color"))
	});

	// 03. Sticky Header
	$(window).on('scroll', function () {
		var scroll = $(window).scrollTop();
		if (scroll < 100) {
			$("#header-sticky").removeClass("header-sticky");
		} else {
			$("#header-sticky").addClass("header-sticky");
		}
	});

	// 04. Hero Slider (Ghain)
	if ($('.ghain-hero-swiper').length > 0) {
		console.log('Initializing Ghain Hero Slider...');

		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		var heroSlider = new Swiper('.ghain-hero-swiper', {
			slidesPerView: 1,
			loop: true,
			rtl: true,
			speed: 800,
			effect: 'fade',
			fadeEffect: {
				crossFade: true
			},

			// Navigation arrows
			navigation: {
				nextEl: '.ghain-hero-arrow--next',
				prevEl: '.ghain-hero-arrow--prev',
			},

			// Pagination dots
			pagination: {
				el: '.ghain-hero-dots',
				clickable: true,
				dynamicBullets: false,
			},

			// Autoplay (disabled if user prefers reduced motion)
			autoplay: prefersReducedMotion ? false : {
				delay: 5500,
				disableOnInteraction: false,
				pauseOnMouseEnter: true,
			},

			// Keyboard navigation
			keyboard: {
				enabled: true,
				onlyInViewport: true,
			},

			// Touch/swipe support (enabled by default in Swiper)
			touchRatio: 1,
			touchAngle: 45,

			// Accessibility
			a11y: {
				enabled: true,
				prevSlideMessage: 'الشريحة السابقة',
				nextSlideMessage: 'الشريحة التالية',
				firstSlideMessage: 'هذه هي الشريحة الأولى',
				lastSlideMessage: 'هذه هي الشريحة الأخيرة',
			},

			on: {
				init: function () {
					console.log('Ghain Hero Slider Initialized');
					// Add loaded class for fade-in effect
					$('.ghain-hero-slider').addClass('loaded');
				}
			}
		});

		// Pause autoplay on hover (desktop only)
		if (!prefersReducedMotion && window.innerWidth >= 768) {
			$('.ghain-hero-slider').on('mouseenter', function () {
				if (heroSlider.autoplay) {
					heroSlider.autoplay.stop();
				}
			});

			$('.ghain-hero-slider').on('mouseleave', function () {
				if (heroSlider.autoplay) {
					heroSlider.autoplay.start();
				}
			});
		}
	}

	// 05. Best Seller Slider
	if ($('.tp-best-seller-slider-active').length > 0) {
		var slider = new Swiper('.tp-best-seller-slider-active', {
			slidesPerView: 4,
			spaceBetween: 30,
			rtl: true,
			scrollbar: {
				el: '.tp-swiper-scrollbar-drag',
				draggable: true,
			},
			breakpoints: {
				1200: { slidesPerView: 4, },
				992: { slidesPerView: 3, },
				768: { slidesPerView: 2, },
				576: { slidesPerView: 2, },
				0: { slidesPerView: 1, },
			},
		});
	}

	// 06. Popular Product Slider
	if ($('.tp-product-popular-slider-active').length > 0) {
		var slider = new Swiper('.tp-product-popular-slider-active', {
			slidesPerView: 4,
			spaceBetween: 30,
			rtl: true,
			scrollbar: {
				el: '.tp-swiper-scrollbar-drag',
				draggable: true,
			},
			breakpoints: {
				1200: { slidesPerView: 4, },
				992: { slidesPerView: 3, },
				768: { slidesPerView: 2, },
				576: { slidesPerView: 2, },
				0: { slidesPerView: 2, },
			},
		});
	}

	// 09. Makhawir Product Slider
	$('.tp-makhawir-slider-active').each(function () {
		var sliderCommon = $(this);
		var sliderScrollbar = sliderCommon.siblings('.tp-swiper-scrollbar');

		new Swiper(sliderCommon[0], {
			slidesPerView: 4,
			spaceBetween: 30,
			rtl: true,
			observer: true,
			observeParents: true,
			scrollbar: {
				el: sliderScrollbar[0],
				draggable: true,
			},
			breakpoints: {
				1200: { slidesPerView: 4, },
				992: { slidesPerView: 3, },
				768: { slidesPerView: 2, },
				576: { slidesPerView: 2, },
				0: { slidesPerView: 2, },
			},
		});
	});

	// 09. Related Product Slider
	if ($('.tp-product-related-slider-active').length > 0) {
		var slider = new Swiper('.tp-product-related-slider-active', {
			slidesPerView: 4,
			spaceBetween: 30,
			rtl: true,
			scrollbar: {
				el: '.tp-related-swiper-scrollbar',
				draggable: true,
			},
			breakpoints: {
				1200: { slidesPerView: 4, },
				992: { slidesPerView: 3, },
				768: { slidesPerView: 2, },
				576: { slidesPerView: 2, },
				0: { slidesPerView: 2, },
			},
		});
	}

	// 07. Testimonial Slider
	if ($('.tp-testimonial-slider-active').length > 0) {
		var testimonialSlider = new Swiper('.tp-testimonial-slider-active', {
			slidesPerView: 1,
			spaceBetween: 30,
			rtl: true,
			loop: true,
			speed: 600,

			// Auto-rotation every 4 seconds
			autoplay: {
				delay: 4000,
				disableOnInteraction: false,
				pauseOnMouseEnter: true,
			},

			// Navigation arrows
			navigation: {
				nextEl: '.tp-testimonial-slider-button-next',
				prevEl: '.tp-testimonial-slider-button-prev',
			},

			// Pagination dots
			pagination: {
				el: '.tp-testimonial-slider-dot',
				clickable: true,
			},

			// Keyboard navigation
			keyboard: {
				enabled: true,
				onlyInViewport: true,
			},

			// Accessibility
			a11y: {
				enabled: true,
				prevSlideMessage: 'المراجعة السابقة',
				nextSlideMessage: 'المراجعة التالية',
			},
		});
	}

	// 08. MeanMenu

	if (jQuery.fn.meanmenu) {
		$('.tp-main-menu-content').meanmenu({
			meanScreenWidth: "1199",
			meanMenuContainer: '.tp-main-menu-mobile',
			meanMenuClose: "<span>X</span>",
			meanMenuOpen: "<span></span>",
			meanRevealPosition: "right",
			meanMenuCloseSize: "18px",
			meanMenuOpenSize: "18px",
			siteLogo: "assets/img/logo/logo.svg"
		});
	}

	// 07. Mobile Sidebar
	$('.tp-offcanvas-open-btn').on('click', function () {
		$('.offcanvas__area').addClass('offcanvas-opened');
		$('.body-overlay').addClass('opened');
	});
	$('.offcanvas-close-btn').on('click', function () {
		$('.offcanvas__area').removeClass('offcanvas-opened');
		$('.body-overlay').removeClass('opened');
	});
	$('.body-overlay').on('click', function () {
		$('.offcanvas__area').removeClass('offcanvas-opened');
		$('.body-overlay').removeClass('opened');
	});

	// Color Variation Active Class Toggle
	$('.tp-color-variation-btn').on('click', function () {
		$(this).addClass('active').siblings().removeClass('active');
	});

});
