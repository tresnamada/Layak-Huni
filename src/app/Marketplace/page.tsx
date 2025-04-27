"use client"
// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, ChevronUp, Heart, User, X, ChevronLeft, ChevronRight, Filter, Star } from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('popular');
  const [activeProduct, setActiveProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sliderRef = useRef(null);

  // Sample product data
  const products = [
    {
      id: 1,
      name: 'Meja Kopi Minimalis',
      price: 1299000,
      image: '/api/placeholder/400/300',
      category: 'Ruang Tamu',
      rating: 4.5,
      reviews: 24,
      description: 'Meja kopi bergaya minimalis dengan desain elegan yang cocok untuk ruang tamu modern Anda. Terbuat dari kayu jati berkualitas tinggi dengan finishing premium.',
      stock: 15
    },
    {
      id: 2,
      name: 'Kursi Makan Modern',
      price: 599000,
      image: '/api/placeholder/400/300',
      category: 'Ruang Makan',
      rating: 4.2,
      reviews: 18,
      description: 'Kursi makan modern dengan bantalan empuk dan rangka kokoh. Sempurna untuk melengkapi ruang makan Anda dengan sentuhan kontemporer.',
      stock: 8
    },
    {
      id: 3,
      name: 'Lampu Lantai Elegan',
      price: 899000,
      image: '/api/placeholder/400/300',
      category: 'Pencahayaan',
      rating: 4.7,
      reviews: 32,
      description: 'Lampu lantai elegan dengan desain unik dan pencahayaan yang nyaman. Tambahkan suasana hangat di sudut ruangan Anda.',
      stock: 5
    },
    {
      id: 4,
      name: 'Sofa Kontemporer',
      price: 3499000,
      image: '/api/placeholder/400/300',
      category: 'Ruang Tamu',
      rating: 4.8,
      reviews: 42,
      description: 'Sofa kontemporer dengan kain premium dan dudukan yang nyaman. Dirancang untuk kenyamanan maksimal dan tampilan mewah.',
      stock: 3
    },
    {
      id: 5,
      name: 'Rak Buku Artisan',
      price: 1899000,
      image: '/api/placeholder/400/300',
      category: 'Penyimpanan',
      rating: 4.3,
      reviews: 15,
      description: 'Rak buku bergaya artisan dengan kompartemen penyimpanan yang luas. Sempurna untuk menampilkan koleksi buku dan hiasan Anda.',
      stock: 7
    },
    {
      id: 6,
      name: 'Meja Samping Tempat Tidur',
      price: 799000,
      image: '/api/placeholder/400/300',
      category: 'Kamar Tidur',
      rating: 4.1,
      reviews: 9,
      description: 'Meja samping tempat tidur dengan desainer berkelas. Tambahkan kenyamanan dan gaya di samping tempat tidur Anda.',
      stock: 12
    },
    {
      id: 7,
      name: 'Kanvas Seni Dinding',
      price: 459000,
      image: '/api/placeholder/400/300',
      category: 'Dekorasi',
      rating: 4.6,
      reviews: 28,
      description: 'Kanvas seni dinding dengan lukisan abstrak modern. Berikan sentuhan artistik pada dinding kosong Anda.',
      stock: 20
    },
    {
      id: 8,
      name: 'Kursi Berlengan Aksen',
      price: 1799000,
      image: '/api/placeholder/400/300',
      category: 'Ruang Tamu',
      rating: 4.4,
      reviews: 21,
      description: 'Kursi berlengan aksen dengan desain mewah dan kain berkualitas tinggi. Tambahkan nuansa eksklusif di ruang tamu Anda.',
      stock: 4
    },
    {
      id: 9,
      name: 'Set Meja Makan Kayu Solid',
      price: 4999000,
      image: '/api/placeholder/400/300',
      category: 'Ruang Makan',
      rating: 4.9,
      reviews: 36,
      description: 'Set meja makan dari kayu jati solid dengan 6 kursi. Kombinasi sempurna antara fungsi dan estetika untuk jamuan makan Anda.',
      stock: 2
    },
    {
      id: 10,
      name: 'Kabinet Dapur Minimalis',
      price: 2499000,
      image: '/api/placeholder/400/300',
      category: 'Dapur',
      rating: 4.5,
      reviews: 19,
      description: 'Kabinet dapur minimalis dengan laci dan rak penyimpanan. Tingkatkan efisiensi dan tampilan dapur Anda.',
      stock: 6
    }
  ];

  // Categories in Indonesian
  const categories = ['Semua', 'Ruang Tamu', 'Ruang Makan', 'Kamar Tidur', 'Pencahayaan', 'Penyimpanan', 'Dekorasi', 'Dapur'];

  // Handle scroll event to update navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Add item to cart
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? {...item, quantity: item.quantity + 1} : item
      ));
    } else {
      setCartItems([...cartItems, {...product, quantity: 1}]);
    }
    
    // Show cart briefly
    setShowCart(true);
    setTimeout(() => {
      if (!document.querySelector('.cart-dropdown:hover')) {
        setShowCart(false);
      }
    }, 3000);
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === productId ? {...item, quantity: newQuantity} : item
    ));
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Format price in IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] * 10000 && product.price <= priceRange[1] * 10000
    );
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }
    
    // Sort products
    switch(sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // popular (by reviews)
        filtered.sort((a, b) => b.reviews - a.reviews);
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Show quick view modal
  const openQuickView = (product) => {
    setActiveProduct(product);
    setShowQuickView(true);
  };

  // Slider navigation
  const scroll = (direction) => {
    const { current } = sliderRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF4DE]">

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30 }}
            >
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <span className="font-bold text-xl text-[#938656]">Menu</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="py-4">
                <div className="px-5 mb-4">
                  <input 
                    type="text" 
                    placeholder="Cari produk..." 
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#938656]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <nav className="space-y-1">
                  {["Beranda", "Koleksi", "Tentang Kami", "Inspirasi", "Kontak"].map((item, index) => (
                    <a 
                      key={index} 
                      href="#" 
                      className="block px-5 py-3 text-gray-600 hover:bg-[#EAF4DE] hover:text-[#938656]"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-center text-[#938656] mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Kategori Unggulan
          </motion.h2>
          
          <div className="relative">
            <motion.button 
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hidden md:block"
              onClick={() => scroll('left')}
              whileHover={{ scale: 1.1 }}
            >
              <ChevronLeft size={24} className="text-[#938656]" />
            </motion.button>
            
            <motion.div 
              className="flex overflow-x-auto pb-6 scrollbar-hide"
              ref={sliderRef}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {categories.slice(1).map((category, index) => (
                <motion.div
                  key={index}
                  className="min-w-[200px] mr-6"
                  whileHover={{ y: -10 }}
                >
                  <div className="bg-[#f8faf5] rounded-lg overflow-hidden shadow-md hover:shadow-lg cursor-pointer"
                       onClick={() => setSelectedCategory(category)}>
                    <img 
                      src={`/api/placeholder/200/150`}
                      alt={category} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4 text-center">
                      <h3 className="font-medium text-gray-800">{category}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.button 
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hidden md:block"
              onClick={() => scroll('right')}
              whileHover={{ scale: 1.1 }}
            >
              <ChevronRight size={24} className="text-[#938656]" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Filter and Products */}
      <section className="py-12 bg-[#f8faf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <motion.div 
              className={`md:w-1/4 lg:w-1/5 ${showFilters ? 'block' : 'hidden md:block'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-lg shadow-md p-5">
                <div className="flex justify-between items-center mb-4 md:hidden">
                  <h3 className="font-bold text-lg">Filter</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Kategori</h3>
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <input 
                          type="radio" 
                          id={`cat-${index}`} 
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="text-[#938656] focus:ring-[#938656]"
                        />
                        <label htmlFor={`cat-${index}`} className="ml-2 text-gray-700">{category}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Rentang Harga</h3>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="500" 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0] * 10000)}</span>
                      <span>{formatPrice(priceRange[1] * 10000)}</span>
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  className="w-full bg-[#EAF4DE] text-[#938656] py-2 rounded-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPriceRange([0, 500]);
                    setSelectedCategory('Semua');
                  }}
                >
                  Reset Filter
                </motion.button>
              </div>
            </motion.div>
            
            {/* Products Area */}
            <motion.div 
              className="md:w-3/4 lg:w-4/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-[#938656]">
                    {selectedCategory === 'Semua' ? 'Produk Unggulan' : selectedCategory}
                  </h2>
                  <span className="ml-3 bg-[#EAF4DE] text-[#938656] px-3 py-1 rounded-full text-sm">
                    {filteredProducts.length} produk
                  </span>
                  <button 
                    className="ml-4 md:hidden flex items-center text-[#938656]"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={18} className="mr-1" />
                    Filter
                  </button>
                </div>
                <div className="hidden md:block">
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#938656]"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="popular">Terpopuler</option>
                    <option value="price-asc">Harga: Rendah ke Tinggi</option>
                    <option value="price-desc">Harga: Tinggi ke Rendah</option>
                    <option value="name">Nama</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <img src="/api/placeholder/100/100" alt="No results" className="mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Tidak Ada Produk Ditemukan</h3>
                  <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div 
                      key={product.id}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: product.id * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="relative group">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-52 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <motion.button 
                            className="bg-white text-[#938656] px-4 py-2 rounded-lg shadow-md font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openQuickView(product)}
                          >
                            Lihat Cepat
                          </motion.button>
                        </div>
                        <motion.button 
                          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md"
                          whileHover={{ scale: 1.1, backgroundColor: "#FEF2F2", color: "#EF4444" }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart size={18} className="text-[#938656] group-hover:text-red-500" />
                        </motion.button>
                        {product.stock < 5 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Stok Terbatas
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-1">
                          <p className="text-sm text-gray-500">{product.category}</p>
                          <div className="flex items-center ml-auto">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 hover:text-[#938656] transition-colors cursor-pointer">{product.name}</h3>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-[#938656] font-bold">{formatPrice(product.price)}</p>
                          <motion.button 
                            className="bg-[#EAF4DE] text-[#938656] p-2 rounded-full hover:bg-[#938656] hover:text-white transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingBag size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 hover:bg-[#EAF4DE]">
                      <ChevronLeft size={18} />
                    </button>
                    {[1, 2, 3].map((page) => (
                      <button 
                        key={page} 
                        className={`px-3 py-1 rounded-md ${
                          page === 1 
                            ? 'bg-[#938656] text-white' 
                            : 'border border-gray-300 text-gray-700 hover:bg-[#EAF4DE]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 hover:bg-[#EAF4DE]">
                      <ChevronRight size={18} />
                    </button>
                  </nav>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="bg-[#938656] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Penawaran Spesial Musim Ini
                </h2>
                <p className="text-white/90 text-lg mb-8">
                  Dapatkan diskon hingga 30% untuk pembelian furniture pilihan. Penawaran terbatas hanya sampai akhir bulan!
                </p>
                <motion.button 
                  className="bg-white text-[#938656] px-6 py-3 rounded-lg font-medium inline-block self-start"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Lihat Penawaran
                </motion.button>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="/api/placeholder/600/400" 
                  alt="Special Offer" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && activeProduct && (
          <motion.div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="relative">
                <button 
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md"
                  onClick={() => setShowQuickView(false)}
                >
                  <X size={20} className="text-gray-500" />
                </button>
                
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 p-6">
                    <img 
                      src={activeProduct.image} 
                      alt={activeProduct.name} 
                      className="w-full h-auto object-cover rounded-lg"
                    />
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[...Array(4)].map((_, idx) => (
                        <img 
                          key={idx} 
                          src={activeProduct.image} 
                          alt={`${activeProduct.name} thumbnail`} 
                          className="w-full h-16 object-cover rounded border-2 border-transparent hover:border-[#938656] cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 p-6">
                    <span className="text-sm text-gray-500">{activeProduct.category}</span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1 mb-2">{activeProduct.name}</h2>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, idx) => (
                          <Star 
                            key={idx}
                            size={18} 
                            className={`${
                              idx < Math.floor(activeProduct.rating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            } mr-1`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({activeProduct.reviews} ulasan)
                      </span>
                    </div>
                    
                    <p className="text-2xl font-bold text-[#938656] mb-4">
                      {formatPrice(activeProduct.price)}
                    </p>
                    
                    <p className="text-gray-600 mb-6">
                      {activeProduct.description}
                    </p>
                    
                    <div className="mb-6">
                      <p className="font-medium mb-2">Ketersediaan:</p>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full ${activeProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                        <span>
                          {activeProduct.stock > 0 
                            ? `Tersedia (${activeProduct.stock} item)`
                            : 'Stok Habis'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-4 py-2 border-x border-gray-300">1</span>
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
                      </div>
                      
                      <motion.button 
                        className="bg-[#938656] text-white px-6 py-2 rounded-lg font-medium flex-1 flex items-center justify-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          addToCart(activeProduct);
                          setShowQuickView(false);
                        }}
                      >
                        <ShoppingBag size={18} className="mr-2" />
                        Tambahkan ke Keranjang
                      </motion.button>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button className="flex items-center text-gray-600 hover:text-[#938656]">
                        <Heart size={18} className="mr-2" />
                        Tambah ke Wishlist
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-[#938656]">
                        <Share2 size={18} className="mr-2" />
                        Bagikan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <motion.button 
        className="fixed bottom-6 right-6 bg-[#938656] text-white p-3 rounded-full shadow-lg z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : 20 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp size={24} />
      </motion.button>
    </div>
  );
}
                  