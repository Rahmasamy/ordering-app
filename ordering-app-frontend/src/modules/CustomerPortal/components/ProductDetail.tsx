import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { formatCurrency } from '@/shared/lib/utils';
import { ChevronLeft, Star, Plus, Minus, Flame, Leaf, Compass, ShoppingCart, Video, Heart, CheckCircle2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '@/shared/api/product.service';
import { restaurantService } from '@/shared/api/restaurant.service';
import { contentService, ProductContentResponse } from '@/shared/api/content.service';
import { useCart } from '@/shared/hooks/useCart';

function formatReviewDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useAppState();

  const [product, setProduct] = useState<any | null>(null);
  const [productContent, setProductContent] = useState<ProductContentResponse | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedDoneness, setSelectedDoneness] = useState<string>('Medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'story' | 'ingredients' | 'reviews'>('story');
  const [activeImage, setActiveImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart API state via hook
  const { 
    cartData, 
    isCartOpen, 
    setIsCartOpen, 
    isAdding, 
    fetchCart, 
    addToCart: addCartItem, 
    removeFromCart: removeCartItem 
  } = useCart();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const [prodData, cats, content] = await Promise.all([
          productService.getById(id),
          restaurantService.getGlobalCategories(),
          contentService.getProductContent(id).catch(() => ({ story: null, ingredients: [], testimonials: [] })),
        ]);
        
        // Map database product fields to match food item schema
        const matchedCat = cats.find((c: any) => Number(c.id) === Number(prodData.categoryId));
        const mappedProduct = {
          ...prodData,
          price: prodData.price ? Number(prodData.price) : 1299,
          image: prodData.imageUrl || prodData.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
          category: matchedCat ? matchedCat.name : 'Mains',
          donenessOptions: prodData.donenessOptions || null,
          addons: prodData.addons || [],
          rating: prodData.rating || 4.8,
          reviewsCount: prodData.reviewsCount || 128,
          calories: prodData.calories || null,
          isDairyFree: prodData.isDairyFree || false,
          isChefSpecial: prodData.isChefSpecial || false,
          isPopular: prodData.isPopular || false
        };

        setProduct(mappedProduct);
        setProductContent(content);
        setCategories(cats);
        setActiveImage(mappedProduct.image);
        if (mappedProduct.donenessOptions && mappedProduct.donenessOptions.length > 0) {
          setSelectedDoneness(mappedProduct.donenessOptions[0]);
        } else {
          setSelectedDoneness('Medium');
        }
      } catch (err: any) {
        console.error('Error loading product details:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    fetchCart();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] gap-4">
        <div className="w-12 h-12 border-4 border-[#b3360c]/20 border-t-[#b3360c] rounded-full animate-spin"></div>
        <p className="text-gray-500 text-xs font-bold tracking-wider animate-pulse uppercase">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] p-6 text-center gap-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-lg font-bold border border-red-100 shadow-xs mb-2">⚠</div>
        <h2 className="text-lg font-bold text-gray-900">Failed to Load Product</h2>
        <p className="text-red-500 text-xs max-w-md bg-[#fdfafb] border border-red-100/50 px-4 py-2 rounded-xl font-mono">{error || 'Product not found'}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-2 bg-[#b3360c] hover:bg-[#942a08] transition text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Calculate current item cost based on extras
  const addonPrices = product.addons || [];
  const activeAddonCost = addonPrices
    .filter((a: any) => selectedAddons.includes(a.name))
    .reduce((sum: number, current: any) => sum + current.price, 0);

  const singleItemPrice = product.price + activeAddonCost;
  const totalPrice = singleItemPrice * quantity;

  const story = productContent?.story ?? null;
  const ingredients = productContent?.ingredients ?? [];
  const testimonials = productContent?.testimonials ?? [];
  const reviewsCount = testimonials.length > 0 ? testimonials.length : (product.reviewsCount || 0);

  const handleToggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddToCart = async () => {
    try {
      await addCartItem({
        productId: Number(product.id),
        quantity,
        selectedDoneness: product.donenessOptions ? selectedDoneness : undefined,
        selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined
      });
    } catch (err: any) {
      setToastMessage(err?.message || 'Failed to add to cart. Please try again.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    try {
      await removeCartItem(productId);
    } catch (err) {
      // Error is logged in hook
    }
  };

  return (
    <div className="bg-[#fcfbfc] min-h-screen text-gray-900 font-sans pb-24">
      {/* Breadcrumbs header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
          <span>Browse</span>
          <span className="text-gray-300">/</span>
          <span>{product.category || 'Mains'}</span>
          <span className="text-gray-300">/</span>
          <span className="text-[#b3360c] truncate max-w-[150px]">{product.name}</span>
        </button>

       

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold text-gray-400">OrderFlow Premium</span>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-700"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartData && cartData.items && cartData.items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b3360c] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartData.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Graphics and Photos */}
        <div className="lg:col-span-7 space-y-6">
          <div className="h-[460px] relative bg-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <img 
              src={activeImage} 
              alt={product.name} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            
            {/* Top labels */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              {product.isChefSpecial && (
                <span className="bg-[#121d21] text-white uppercase text-[9px] tracking-widest font-extrabold px-3 py-1.5 rounded-full shadow-md">
                  Chef's Special
                </span>
              )}
              {product.isPopular && (
                <span className="bg-[#c23e11] text-white uppercase text-[9px] tracking-widest font-extrabold px-3 py-1.5 rounded-full shadow-md">
                  Popular
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.image])
              .slice(0, 2)
              .map((imgUrl: string, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`h-28 rounded-2xl overflow-hidden border cursor-pointer transition duration-200 ${
                    activeImage === imgUrl ? 'border-[#b3360c] ring-2 ring-[#b3360c]/20' : 'border-gray-100 hover:border-[#b3360c]'
                  }`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`${product.name} gallery ${idx + 1}`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
           
          </div>
        </div>

        {/* Right Column: Information Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-gray-900 text-xs font-bold ml-1">({product.reviewsCount || 124} Reviews)</span>
              </div>
              
              <div className="h-5 w-px bg-gray-200" />
              
              <span className="text-2xl font-black text-[#b3360c]">{formatCurrency(product.price)}</span>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
              {product.description}
            </p>

            {/* Calories and allergens matching Screen 4 chips */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {product.calories && (
                <div className="flex items-center gap-1 bg-[#fbf5f2] border border-red-50 px-3 py-1.5 rounded-xl text-gray-700 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-[#b3360c]" />
                  <span>{product.calories} Cal</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-[#f4faf7] border border-emerald-50 px-3 py-1.5 rounded-xl text-gray-700 text-xs font-semibold">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{product.isDairyFree ? 'Dairy Free' : 'Dairy Free Option'}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-xl text-gray-600 text-xs font-semibold">
                <span>🌾 Contains Gluten</span>
              </div>
            </div>

            {/* Customizer */}
            <div className="border-t border-gray-100 pt-6 mb-8">
              <h3 className="text-[10px] font-mono tracking-widest text-gray-400 font-extrabold uppercase mb-4">
                Customize your order
              </h3>

              {/* Doneness Options if any */}
              {product.donenessOptions && (
                <div className="mb-6">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-3">
                    Choose Your Doneness
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {product.donenessOptions.map((opt) => {
                      const isActive = selectedDoneness === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setSelectedDoneness(opt)}
                          className={`py-3.5 px-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#fcf3f0] border-[#b3360c] text-[#b3360c] shadow-xs'
                              : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons List with explicit prices */}
              {addonPrices.length > 0 && (
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-3">
                    Add-ons
                  </label>
                  
                  {addonPrices.map((add) => {
                    const isChecked = selectedAddons.includes(add.name);
                    return (
                      <div
                        key={add.name}
                        onClick={() => handleToggleAddon(add.name)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                          isChecked
                            ? 'bg-[#fdfbfc] border-red-100/50'
                            : 'bg-white hover:bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-[#b3360c] border-[#b3360c]'
                              : 'bg-white border-gray-300'
                          }`}>
                            {isChecked && <div className="w-2 h-2 rounded bg-white" />}
                          </div>
                          <span className="text-xs font-semibold text-gray-800">{add.name}</span>
                        </div>
                        
                        <span className="text-xs font-bold text-gray-500">
                          {add.price === 0 ? 'Free' : `+$${add.price.toFixed(2)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom quantity selector and giant Add to cart action bar */}
          <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl p-1.5 h-14 border border-gray-150">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 hover:bg-white text-gray-500 hover:text-gray-900 rounded-lg flex items-center justify-center transition active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-extrabold text-sm text-gray-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 hover:bg-white text-gray-500 hover:text-gray-900 rounded-lg flex items-center justify-center transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#b3360c] hover:bg-[#942a08] transition text-white px-8 h-14 rounded-xl font-bold flex items-center justify-between shadow-lg shadow-red-900/10 cursor-pointer group"
            >
              <span>Add to Cart</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="text-sm font-black group-hover:scale-105 transition-transform">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Story / Ingredients / Reviews section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 border-t border-gray-100 pt-10">
        <div className="flex items-center gap-6 border-b border-gray-100 pb-3">
          <button
            onClick={() => setActiveTab('story')}
            className={`font-extrabold text-xs uppercase tracking-wider pb-3 transition relative cursor-pointer ${
              activeTab === 'story' ? 'text-[#b3360c]' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            The Story
            {activeTab === 'story' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b3360c]" />}
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`font-extrabold text-xs uppercase tracking-wider pb-3 transition relative cursor-pointer ${
              activeTab === 'ingredients' ? 'text-[#b3360c]' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Ingredients
            {activeTab === 'ingredients' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b3360c]" />}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`font-extrabold text-xs uppercase tracking-wider pb-3 transition relative cursor-pointer ${
              activeTab === 'reviews' ? 'text-[#b3360c]' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Reviews ({reviewsCount})
            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b3360c]" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
          <div className="lg:col-span-8">
            {activeTab === 'story' && (
              <div className="space-y-4">
                {story ? (
                  <>
                    <h4 className="text-lg font-black text-gray-900">{story.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-2xl font-medium">
                      {story.content}
                    </p>
                    {story.featuredQuote && (
                      <div className="bg-[#fcfbfc] p-5 rounded-2xl border border-gray-100 text-gray-600 text-xs italic mt-6 max-w-2xl flex items-start gap-3">
                        <span className="text-2xl text-[#b3360c]">"</span>
                        <p className="leading-relaxed">{story.featuredQuote}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm font-medium">No story available for this product yet.</p>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h4 className="text-lg font-black text-gray-900">Premium Quality Sourcing</h4>
                <p className="text-gray-500 text-sm leading-relaxed max-w-2xl font-medium">
                  We believe in complete transparency. Every component of this dish is tracked from farm to kitchen.
                </p>

                {ingredients.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    {ingredients.map((ing) => (
                      <li key={ing.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#b3360c] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-xs text-gray-900 block">{ing.name}</span>
                          {ing.description && (
                            <span className="text-gray-500 text-[11px] mt-0.5 block leading-tight">{ing.description}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm font-medium mt-4">Ingredient details coming soon.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h4 className="text-lg font-black text-gray-900">User Opinions</h4>
                {testimonials.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {testimonials.map((rev) => (
                      <div key={rev.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-gray-900">{rev.authorName || 'Anonymous'}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{formatReviewDate(rev.createdAt)}</span>
                        </div>
                        {rev.rating != null && (
                          <div className="flex text-amber-400 gap-0.5 mb-2">
                            {Array.from({ length: Math.round(rev.rating) }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        )}
                        <p className="text-gray-600 text-xs mt-1 leading-relaxed">{rev.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm font-medium mt-4">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>
            )}
          </div>

          {story?.chef && (
            <div className="lg:col-span-4 bg-gray-50 p-6 rounded-[28px] border border-gray-200/60 self-start">
              <h5 className="text-[10px] uppercase tracking-widest text-[#b3360c] font-black mb-4">Created By</h5>

              <div className="flex items-center gap-4">
                {story.chef.imageUrl && (
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={story.chef.imageUrl}
                      alt={story.chef.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="font-extrabold text-sm text-gray-900 block">{story.chef.name}</span>
                  <span className="text-gray-400 text-xs block font-medium">{story.chef.title}</span>
                </div>
              </div>

              {story.chef.quote && (
                <p className="text-gray-500 font-medium text-xs italic mt-5 leading-relaxed bg-[#fcfbfc] border border-gray-150 p-3.5 rounded-2xl relative">
                  "{story.chef.quote}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#b3360c]">
                  <ShoppingCart className="w-5 h-5" />
                  <h2 className="text-lg font-black tracking-tight">Your Cart</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {!cartData || !cartData.items || cartData.items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <ShoppingCart className="w-12 h-12 text-gray-200" />
                    <p className="font-semibold text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartData.items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                          <img src={item.product.imageUrl || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{item.product.name}</h4>
                            <button 
                              onClick={() => handleRemoveFromCart(Number(item.product.id))}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mb-2">
                            {formatCurrency(item.unitPrice)}
                          </p>
                          {(item.selectedDoneness || (item.selectedAddons && item.selectedAddons.length > 0)) && (
                            <div className="text-[10px] text-gray-400 mb-2 leading-tight">
                              {item.selectedDoneness && <span className="block border-l-2 border-gray-300 pl-1.5 mb-0.5">{item.selectedDoneness}</span>}
                              {item.selectedAddons && item.selectedAddons.map((add: string) => (
                                <span key={add} className="block border-l-2 border-gray-300 pl-1.5 mb-0.5">+{add}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600">Qty: {item.quantity}</span>
                            <span className="font-black text-[#b3360c] text-sm">{formatCurrency(item.subtotal)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartData && cartData.items && cartData.items.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-semibold text-sm">Total</span>
                    <span className="text-2xl font-black text-gray-900">{formatCurrency(cartData.total)}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-[#b3360c] hover:bg-[#942a08] transition text-white h-12 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-red-900/10 cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-red-400 font-bold text-xs">!</span>
            </div>
            <span className="text-sm font-medium flex-1">{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-1 text-gray-400 hover:text-white transition cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
