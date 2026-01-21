/**
 * Products Data
 * Contains sample data for the application.
 */

const productsData = [
    {
        id: '1',
        title: 'مخور حرير فاخر',
        category: 'مخاوير',
        price: '300.00',
        oldPrice: '450.00',
        description: 'مخور حرير بجودة عالية وتصميم عصري يناسب جميع المناسبات.',
        image: 'assets/img/products/1.png',
        images: ['assets/img/products/1.png', 'assets/img/products/1.png'],
        rating: 5,
        reviews: 36,
        inStock: true
    },
    {
        id: '2',
        title: 'مخور قطن مريح',
        category: 'مخاوير',
        price: '250.00',
        oldPrice: '350.00',
        description: 'مخور قطن بارد ومريح للاستخدام اليومي.',
        image: 'assets/img/products/2.png',
        images: ['assets/img/products/2.png', 'assets/img/products/3.png'],
        rating: 4,
        reviews: 24,
        inStock: true
    },
    {
        id: '3',
        title: 'مخور بناتي',
        category: 'مخاوير',
        price: '180.00',
        oldPrice: '220.00',
        description: 'مخور بناتي بتصاميم جذابة وعصرية.',
        image: 'assets/img/products/3.png',
        images: ['assets/img/products/3.png', 'assets/img/products/1.png'],
        rating: 5,
        reviews: 12,
        inStock: true
    },
    {
        id: '4',
        title: 'جلابية مناسبات',
        category: 'جلابيات',
        price: '480.00',
        oldPrice: '600.00',
        description: 'جلابية فاخرة للمناسبات الخاصة والأعياد.',
        image: 'assets/img/products/1.png',
        images: ['assets/img/products/1.png', 'assets/img/products/2.png'],
        rating: 5,
        reviews: 45,
        inStock: true
    },
    {
        id: '5',
        title: 'جلابية رجالي',
        category: 'جلابيات',
        price: '180.00',
        oldPrice: '250.00',
        description: 'جلابية رجالي مريحة وأنيقة.',
        image: 'assets/img/products/2.png',
        images: ['assets/img/products/2.png', 'assets/img/products/1.png'],
        rating: 4,
        reviews: 18,
        inStock: true
    },
    {
        id: '6',
        title: 'طقم شيلة ومخور',
        category: 'شيلات',
        price: '450.00',
        oldPrice: '550.00',
        description: 'طقم متكامل من الشيلة والمخور بنفس التطريز.',
        image: 'assets/img/products/3.png',
        images: ['assets/img/products/2.png', 'assets/img/products/1.png'],
        rating: 5,
        reviews: 30,
        inStock: true
    }
];

function getProductById(id) {
    return productsData.find(p => p.id === id);
}

// Check if we are in a node environment (for testing) or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { productsData, getProductById };
}
