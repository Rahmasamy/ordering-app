import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { FoodItem } from '@/shared/types/global.types';
import { formatCurrency } from '@/shared/lib/utils';
import { Search, MapPin, Sparkles, TrendingUp, Heart, ShoppingBag, ArrowRight, UserPlus, HelpCircle, Shield, ShoppingCart, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeData } from '@/shared/hooks/useHomeData';
import { useCart } from '@/shared/hooks/useCart';

function getCategoryIcon(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('burger') || cat.includes('fast')) return '🍔';
  if (cat.includes('salad') || cat.includes('healthy')) return '🥗';
  if (cat.includes('dessert') || cat.includes('sweet')) return '🍰';
  if (cat.includes('coffee') || cat.includes('drink')) return '☕';
  if (cat.includes('pizza') || cat.includes('italian')) return '🍕';
  return '🍽️';
}

export default function CustomerHome() {
  const navigate = useNavigate();
  const { foodItems, addToCart, cart } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<string>('Trending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [addressInput, setAddressInput] = useState<string>('Home: 123 Maple Ave');

  const { fetchCart, removeFromCart: removeCartItem, addToCart: addCartItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const {
    restaurants,
    nearbyRestaurants,
    activeRestaurantId,
    setActiveRestaurantId,
    dbProducts,
    dbTrendingProducts,
    dbCategories,
    isLoading,
    error,
    fetchNextPage,
    hasMore,
    isFetchingNextPage
  } = useHomeData();

  const handleRestaurantClick = (id: string | number) => {
    setActiveRestaurantId(Number(id));
  };

  const handleQuickAddProduct = async (payload: any) => {
    try {
      await addCartItem({
        productId: Number(payload.product.id),
        quantity: payload.quantity,
        selectedDoneness: payload.selectedDoneness,
        selectedAddons: payload.selectedAddons
      });
    } catch (err) {
      console.error('Failed to quick-add product:', err);
    }
  };

  // Helper to map categoryId to category name
  const getCategoryName = (categoryId: number) => {
    const found = dbCategories.find(c => Number(c.id) === Number(categoryId));
    return found ? found.name : '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] gap-4">
        <div className="w-12 h-12 border-4 border-[#b3360c]/20 border-t-[#b3360c] rounded-full animate-spin"></div>
        <p className="text-gray-500 text-xs font-bold tracking-wider animate-pulse uppercase">Loading delicious meals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] p-6 text-center gap-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-lg font-bold border border-red-100 shadow-xs mb-2">⚠</div>
        <h2 className="text-lg font-bold text-gray-900">Failed to Load Menu Feed</h2>
        <p className="text-red-500 text-xs max-w-md bg-red-50/50 border border-red-100/50 px-4 py-2 rounded-xl font-mono">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-[#b3360c] hover:bg-[#942a08] transition text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md"
        >
          Retry Request
        </button>
      </div>
    );
  }

  // Fallback structures if database tables are empty
  const displayedProducts: FoodItem[] = dbProducts.map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    price: p.price ? Number(p.price) : 0,
    description: p.description || '',
    rating: p.rating || 4.5,
    reviewsCount: p.reviewsCount || 12,
    category: (getCategoryName(p.categoryId) || 'mains') as any,
    image: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isChefSpecial: p.isChefSpecial || p.isTrending || false,
    tags: p.tags || [],
    sku: p.sku || `SKU-${p.id}`,
    stockStatus: 'In Stock',
    warningThreshold: 5,
    taxable: true,
    taxCategory: 'Standard Food (8%)',
    branchAvailability: {},
    fulfillmentOptions: { dineIn: true, takeaway: true, delivery: true }
  }));

  const categoriesList = dbCategories;

  const displayedNearby = (nearbyRestaurants.length > 0 ? nearbyRestaurants : restaurants).map((res: any) => ({
    id: res.id.toString(),
    name: res.name,
    time: '15-25 min',
    rating: res.rating || 4.5,
    desc: res.description || 'Delivering piping hot local bites straight to your doorstep.',
    tags: ['NEARBY', 'FRESH'],
    color: 'from-orange-500 to-red-500',
    image: res.logoURL || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80'
  }));

  // Filters based on state
  const getFilteredItems = () => {
    let items = displayedProducts;
    if (searchQuery.trim() !== '') {
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    if (selectedCategory !== 'Trending' && selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      items = items.filter(
        item => 
          item.category?.toLowerCase() === catLower ||
          (item.tags && item.tags.some(tag => tag.toLowerCase() === catLower))
      );
    }
    return items;
  };

  const filteredItems = getFilteredItems();
  
  // Specific sections corresponding to Screen 1
  const trendingNowItems: FoodItem[] = dbTrendingProducts.map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    price: p.price ? Number(p.price) : 1299,
    description: p.description || '',
    rating: p.rating || 4.7,
    reviewsCount: p.reviewsCount || 24,
    category: (getCategoryName(p.categoryId) || 'mains') as any,
    image: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isChefSpecial: p.isChefSpecial || p.isTrending || false,
    tags: p.tags || ['TRENDING'],
    sku: p.sku || `SKU-${p.id}`,
    stockStatus: 'In Stock',
    warningThreshold: 5,
    taxable: true,
    taxCategory: 'Standard Food (8%)',
    branchAvailability: {},
    fulfillmentOptions: { dineIn: true, takeaway: true, delivery: true }
  }));

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="bg-[#fcfbfc] min-h-screen text-gray-900 font-sans pb-16">
      {/* Search Header Banner */}
      <div className="relative mx-4 mt-4 mb-8 rounded-3xl overflow-hidden shadow-2xl h-[420px] md:h-[460px]">
        {/* Banner image with darken overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop&q=80")' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Floating addresses */}
        <div className="absolute top-6 left-6 right-6 flex flex-wrap gap-3 justify-end items-center z-10">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md text-gray-800 text-xs px-3 py-1.5 rounded-full shadow-md font-medium border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Home: 123 Maple Ave
          </div>
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md text-gray-800 text-xs px-3 py-1.5 rounded-full shadow-md font-medium border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            Office: Tech Hub Bldg B
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-6 pb-12 z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl drop-shadow-sm"
          >
            Crave it. Find it. <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Order it.</span>
          </motion.h1>

          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm p-2 rounded-2xl shadow-xl flex items-center border border-white/50">
            <Search className="text-gray-400 ml-3 w-5 h-5 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search for 'Truffle Burger' or 'Sushi'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-gray-800 px-3 outline-none text-sm placeholder-gray-400 font-medium h-12"
            />
            <button 
              onClick={() => {}}
              className="bg-[#b3360c] hover:bg-[#942a08] transition text-white px-6 h-12 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-red-900/10"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Categories Carousel */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Explore Categories
            </h2>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#b3360c] text-white border-transparent shadow-lg shadow-red-800/10'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Search Results & Category Section */}
        {(searchQuery.trim() !== '' || selectedCategory !== 'Trending') ? (
          <div className="mb-16">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              {searchQuery.trim() !== '' ? `Search Results for "${searchQuery}"` : `${selectedCategory} Menu`}
            </h2>
            <p className="text-xs text-gray-500 mb-6 font-mono uppercase">{filteredItems.length} items discovered</p>
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 mb-2">We couldn't find any meals matching your selection.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Trending');
                  }} 
                  className="text-xs font-semibold text-[#b3360c] hover:underline uppercase"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <CatalogItemCard key={item.id} item={item} onClick={handleProductClick} onQuickAdd={handleQuickAddProduct} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={fetchNextPage}
                      disabled={isFetchingNextPage}
                      className="bg-white hover:bg-gray-50 transition border border-gray-200 text-gray-800 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          <span>Loading more...</span>
                        </>
                      ) : (
                        'Load More Delicious Meals'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Trending Section corresponding perfectly to Home Screen Section */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Trending Now</h2>
                  <p className="text-gray-500 text-sm">The most popular picks in your area this week.</p>
                </div>
                <button 
                  onClick={() => setSelectedCategory('Trending')}
                  className="text-[#b3360c] hover:text-[#942a08] font-bold text-xs flex items-center gap-1 uppercase tracking-wider"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {trendingNowItems.map((item) => (
                  <CatalogItemCard key={item.id} item={item} onClick={handleProductClick} onQuickAdd={handleQuickAddProduct} />
                ))}
              </div>
            </div>

            {/* Nearby Restaurants Panel from mockup */}
            {/* <div className="mb-16">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nearby Restaurants</h2>
                <p className="text-gray-500 text-sm">Delivering piping hot local bites straight to your doorstep.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedNearby.map((res) => {
                  const isActive = activeRestaurantId?.toString() === res.id;
                  return (
                    <div 
                      key={res.id}
                      onClick={() => handleRestaurantClick(res.id)}
                      className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? 'border-[#b3360c] ring-2 ring-[#b3360c]/20 shadow-md scale-[1.01]' 
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-xl'
                      }`}
                    >
                      <div className="h-56 relative overflow-hidden">
                        <img 
                          src={res.image} 
                          alt={res.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          {res.time}
                        </div>

                        
                        <div className="absolute top-4 right-4 bg-orange-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          ★ {res.rating}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-bold text-lg transition ${
                            isActive ? 'text-[#b3360c]' : 'text-gray-900 group-hover:text-[#b3360c]'
                          }`}>{res.name}</h3>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed mb-5 line-clamp-2">{res.desc}</p>
                        
                        <div className="flex items-center justify-between">
                         
                          <div className="flex items-center gap-1.5">
                            {res.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-[#f7f5f7] text-[#5c595c]">
                                {tag}
                              </span>
                            ))}
                          </div>

                     
                          <div className="w-9 h-9 rounded-full bg-[#fcfbfc] hover:bg-[#b3360c] group-hover:bg-[#b3360c]/5 text-[#b3360c] hover:text-[#b3360c] flex items-center justify-center transition border border-[#f5ebf5]">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div> */}

            {/* All Products Catalog */}
            <div className="mb-16">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">All Products</h2>
                <p className="text-gray-500 text-sm">Explore our complete collection of delicious meals.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((item) => (
                  <CatalogItemCard key={item.id} item={item} onClick={handleProductClick} onQuickAdd={handleQuickAddProduct} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={fetchNextPage}
                    disabled={isFetchingNextPage}
                    className="bg-white hover:bg-gray-50 transition border border-gray-200 text-gray-800 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span>Loading more...</span>
                      </>
                    ) : (
                      'Load More Delicious Meals'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Promotional Banners Section - Perfectly aligns with the original screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {/* Promo Card 1: Plan your whole week (New Feature Subscription) */}
              <div className="bg-[#121d21] text-white p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                {/* Background graphic */}
                <div className="absolute -right-10 -bottom-10 opacity-15 text-white">
                  <div className="w-48 h-48 rounded-xl bg-white border-[12px] border-white/25 flex flex-wrap p-4 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded bg-white/40" />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="bg-[#c23e11] text-white uppercase text-[10px] tracking-widest font-extrabold px-3 py-1 rounded-full inline-block mb-4">
                    New Feature
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 max-w-sm">Plan Your Whole Week</h3>
                  <p className="text-gray-300 text-xs md:text-sm max-w-sm leading-relaxed">
                    Subscribe to OrderFlow Pro and schedule your meals ahead of time. Save up to 20% on every order.
                  </p>
                </div>

                <div className="mt-6 z-10">
                  <button 
                    onClick={() => handleProductClick('f1')}
                    className="bg-white hover:bg-gray-100 text-[#121d21] font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Promo Card 2: Refer a Friend */}
              <div className="bg-[#c23e11] text-white p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                {/* User graphic mock */}
                <div className="absolute right-8 bottom-8 text-white/10">
                  <UserPlus className="w-32 h-32" />
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Refer a Friend</h3>
                  <p className="text-white/90 text-xs md:text-sm max-w-sm leading-relaxed">
                    Get $20 credit for every new foodie you invite. There is no limit on your rewards!
                  </p>
                </div>

                <div className="mt-8">
                  <button className="text-white font-extrabold text-xs transition uppercase tracking-wider flex items-center gap-1 hover:underline">
                    Invite Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Little 2 columns for support and eco packaging */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
              <div className="bg-[#e4eff2] text-gray-800 p-6 rounded-3xl flex items-center gap-4 border border-blue-50/50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-900 shadow-sm">
                  <HelpCircle className="w-6 h-6 text-[#b3360c]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">24/7 Support</h4>
                  <p className="text-gray-500 text-xs mt-0.5">We are here to help any time, anywhere.</p>
                </div>
              </div>

              <div className="bg-[#e4e5f7] text-gray-800 p-6 rounded-3xl flex items-center gap-4 border border-indigo-50/50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#c23e11] shadow-sm">
                  <Shield className="w-6 h-6 text-[#c23e11]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Eco Friendly Packaging</h4>
                  <p className="text-gray-500 text-xs mt-0.5">All local partners use 100% biodegradable containers.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Shopping Cart Button (Desktop & Mobile) with Badge count */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setShowCartDrawer(true)} 
            className="bg-[#b3360c] hover:bg-[#942a08] text-white p-4 rounded-full shadow-2xl shadow-red-900/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#c23e11]/20 font-bold"
          >
            <ShoppingCart className="w-6 h-6 animate-pulse" />
            <span className="bg-white text-[#b3360c] text-xs w-5.5 h-5.5 rounded-full flex items-center justify-center font-black">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
            <span className="text-sm font-medium mr-1">{formatCurrency(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer slide-over */}
      <AnimatePresence>
        {showCartDrawer && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartDrawer(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />

            {/* Slider panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col h-full border-l border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">Your Basket</h3>
                  <p className="text-xs text-gray-500">Order from various premium food creators</p>
                </div>
                <button 
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              {/* Basket list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm font-medium">Your basket is empty</p>
                    <button 
                      onClick={() => setShowCartDrawer(false)} 
                      className="text-xs font-bold text-[#b3360c] mt-2 uppercase tracking-wide inline-block"
                    >
                      Browse delicious meals
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex gap-3 relative group"
                    >
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate leading-snug">{item.product.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">
                          Qty: {item.quantity} × {formatCurrency(item.product.price)}
                        </p>
                        
                        {item.selectedDoneness && (
                          <div className="text-[10px] mt-1 text-gray-700 bg-amber-50 rounded border border-amber-100/50 px-1.5 py-0.5 inline-block">
                            Doneness: {item.selectedDoneness}
                          </div>
                        )}

                        {item.selectedAddons.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.selectedAddons.map((add) => (
                              <span key={add} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                + {add}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span className="font-extrabold text-sm text-[#b3360c]">{formatCurrency(item.totalPrice)}</span>
                        
                        <button 
                          onClick={() => removeCartItem(Number(item.product.id))}
                          className="p-1.5 bg-[#fcfbfc] hover:bg-red-50 text-gray-400 hover:text-red-600 border border-red-50 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Secure Checkout section */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Delivery Service Fee</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
                      <span>Estimated Taxes</span>
                      <span className="font-medium">{formatCurrency(cartTotal * 0.08)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-900 font-extrabold pt-1">
                      <span>Total Invoice</span>
                      <span className="text-[#b3360c] text-base">{formatCurrency(cartTotal * 1.08)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowCartDrawer(false);
                      navigate('/checkout');
                    }}
                    className="w-full bg-[#b3360c] hover:bg-[#942a08] text-white py-3.5 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
                  >
                    <span>Proceed to Checkout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponent: Food Item card inside Grid Catalog feed
function CatalogItemCard({ 
  item, 
  onClick, 
  onQuickAdd 
}: { 
  key?: string | number;
  item: FoodItem; 
  onClick: (id: string) => void; 
  onQuickAdd: (item: any) => void;
}) {
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd({
      product: item,
      quantity: 1,
      selectedDoneness: item.donenessOptions?.[0], // Pick default doneness if any
      selectedAddons: [],
      totalPrice: item.price
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div 
      onClick={() => onClick(item.id)}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200/80 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="h-44 relative bg-gray-50 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-60" />
        
        {/* Badges */}
        {item.rating && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-gray-900 font-extrabold text-[10px] px-2 py-1 rounded-full shadow-md flex items-center gap-0.5 border border-white/50">
            ⭐ {item.rating.toFixed(1)}
          </div>
        )}

        {item.isChefSpecial && (
          <div className="absolute top-3 left-3 bg-[#b3360c] text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            Chef's Special
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 leading-tight group-hover:text-[#b3360c] transition truncate">
            {item.name}
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed mt-1.5 line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Price</span>
            <span className="font-black text-base text-[#b3360c]">{formatCurrency(item.price)}</span>
          </div>

          <button
            onClick={handleQuickAdd}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              added 
                ? 'bg-green-600 text-white hover:bg-green-700 animate-bounce' 
                : 'bg-[#b3360c]/5 text-[#b3360c] hover:bg-[#b3360c] hover:text-white'
            }`}
            title="Quick add single item to basket"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
