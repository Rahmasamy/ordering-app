import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { formatCurrency } from '@/shared/lib/utils';
import { PlusCircle, Plus, Filter, Image, Trash2, Edit, AlertCircle, ShoppingBag, Map, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productService, CategoryResponse, ProductResponse } from '@/shared/api/product.service';
import { useAuthStore } from '@/shared/store/auth.store';

export default function MerchantCatalog() {
  const navigate = useNavigate();
  const { deleteProduct, setWizardStep, setNewProductForm } = useAppState();
  const { user } = useAuthStore();
  
  // API State
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('merchant_selected_category_id');
    return saved ? Number(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Sync selectedCategoryId to sessionStorage
  useEffect(() => {
    if (selectedCategoryId !== null) {
      sessionStorage.setItem('merchant_selected_category_id', String(selectedCategoryId));
    }
  }, [selectedCategoryId]);

  // Load categories and products on mount/user change
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch categories
      const categoriesData = await productService.getRestaurantCategories();
      setCategories(categoriesData);

      // Set initial selected category, prioritizing saved value
      if (categoriesData.length > 0) {
        const saved = sessionStorage.getItem('merchant_selected_category_id');
        const savedId = saved ? Number(saved) : null;
        const exists = categoriesData.some(c => Number(c.id) === savedId);
        if (exists && savedId !== null) {
          setSelectedCategoryId(savedId);
        } else {
          setSelectedCategoryId(Number(categoriesData[0].id));
        }
      }

      // Fetch products if user has a restaurantId
      if (user?.restaurantId) {
        const productsData = await productService.getRestaurantProducts(user.restaurantId);
        setProducts(productsData);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load menu data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.restaurantId]);

  const getCategoryProductCount = (categoryId: any) => {
    return products.filter((p) => Number(p.categoryId) === Number(categoryId)).length;
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const response = await productService.createCategory(newCategoryName.trim());
      setModalSuccess(response.message || 'Category processed successfully!');
      
      // Refresh categories
      const updatedCategories = await productService.getRestaurantCategories();
      setCategories(updatedCategories);

      // Select the new category
      if (response.category?.id) {
        setSelectedCategoryId(Number(response.category.id));
      } else {
        const found = updatedCategories.find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
        if (found) {
          setSelectedCategoryId(Number(found.id));
        }
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setNewCategoryName('');
        setModalSuccess(null);
      }, 1000);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create category.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const selectedCategoryName = categories.find((c) => Number(c.id) === Number(selectedCategoryId))?.name || 'Mains';
  const currentCategoryItems = products.filter((item) => Number(item.categoryId) === Number(selectedCategoryId));

  const handleStartWizard = () => {
    setWizardStep(1);
    setNewProductForm({
      name: '',
      price: 0,
      description: '',
      category: selectedCategoryName,
      tags: [],
      sku: `PROD-SKU-${Math.floor(Math.random() * 900) + 100}`,
      stockStatus: 'In Stock',
      warningThreshold: 10,
      taxable: true,
      taxCategory: 'Standard Food (8%)',
      branchAvailability: { b1: true, b2: true },
      fulfillmentOptions: { dineIn: true, takeaway: true, delivery: true },
      allergenWarnings: '',
      rating: 5.0,
      reviewsCount: 1,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      donenessOptions: ['Medium', 'Medium Well', 'Well Done'],
      addons: [
        { name: 'Extra Cheese', price: 15.0 },
        { name: 'Add Mushrooms', price: 20.0 }
      ]
    });
    navigate('/merchant/wizard');
  };

  const handleEditProduct = (item: any) => {
    setNewProductForm({
      ...item,
      image: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
    });
    setWizardStep(1);
    navigate('/merchant/wizard');
  };

  const handleDeleteProduct = async (item: any) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        // Local removal simulation since there is no delete API
        setProducts(prev => prev.filter(p => p.id !== item.id));
        deleteProduct(String(item.id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#b3360c] animate-spin" />
        <p className="text-gray-400 text-xs font-semibold">Loading menu builder catalog...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      {/* Left Sidebar Category Navigator panel */}
      <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
        <div className="bg-white p-6 rounded-[28px] border border-gray-150/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-gray-900 text-sm tracking-tight">Categories</h3>
            <button 
              onClick={() => {
                setModalError(null);
                setModalSuccess(null);
                setNewCategoryName('');
                setIsModalOpen(true);
              }}
              className="text-[#b3360c] hover:text-[#942a08] transition cursor-pointer"
              title="Add Custom Category"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
            {categories.length === 0 ? (
              <p className="text-gray-400 text-center py-4 text-xs font-semibold">No categories yet.</p>
            ) : (
              categories.map((cat) => {
                const isActive = selectedCategoryId === cat.id;
                const count = getCategoryProductCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#b3360c]/5 text-[#b3360c] font-black'
                        : 'bg-transparent text-gray-500 hover:bg-gray-55 hover:text-gray-900'
                    }`}
                  >
                    <span className="capitalize">{cat.name}</span>
                    <span className={`w-5.5 h-5.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isActive ? 'bg-[#b3360c] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Menu Health Widget */}
        <div className="bg-[#fff0e6] p-6 rounded-[28px] border border-[#ffe0cc] relative overflow-hidden">
          <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#b3360c] uppercase block mb-2">Menu Health</span>
          <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#b3360c] rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-gray-600 text-[11px] leading-relaxed">
            <span className="font-extrabold text-[#b3360c]">85%</span> of items have high-resolution photos. Excellent catalog score.
          </p>
        </div>
      </div>

      {/* Right Column Grid items viewer */}
      <div className="lg:col-span-9 bg-white p-6 md:p-8 rounded-[32px] border border-gray-150/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight capitalize">{selectedCategoryName} Catalog</h2>
            <p className="text-gray-400 text-xs font-semibold mt-0.5">Showing all items in {selectedCategoryName} category.</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
         

            <button 
              onClick={handleStartWizard}
              className="bg-[#b3360c] hover:bg-[#942a08] transition text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-650 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Products Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentCategoryItems.map((item) => {
            const isOutOfStock = item.reviewsCount && item.reviewsCount > 500; // Simulating stock from some attribute or default
            
            return (
              <div 
                key={item.id} 
                className="bg-gray-55 border border-gray-150/60 rounded-3xl overflow-hidden flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="h-44 relative bg-gray-150 overflow-hidden">
                    <img 
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                    
                    {/* Stock Status Badge */}
                    <div className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${
                      isOutOfStock
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-emerald-800 border border-emerald-50'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-sm text-gray-900 leading-tight group-hover:text-[#b3360c] transition truncate max-w-[130px]" title={item.name}>
                        {item.name}
                      </h4>
                      <span className="font-black text-xs text-[#b3360c]">{formatCurrency(item.price || 0)}</span>
                    </div>

                    <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-gray-100/50 mt-3">
                  <div className="flex items-center justify-between mb-3.5 pt-3">
                    <div className="flex items-center gap-1">
                      <span className="w-5 h-5 bg-orange-100 text-[#b3360c] rounded flex items-center justify-center font-bold text-[8px] tracking-tight">DT</span>
                      {item.isPopular && (
                        <span className="w-5 h-5 bg-purple-100 text-purple-800 rounded flex items-center justify-center font-bold text-[8px] tracking-tight">SO</span>
                      )}
                      <span className="text-[10px] text-gray-300 font-medium">|</span>
                      <span className="text-[10.5px] font-bold text-gray-500">Active</span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition duration-300">
                      <button 
                        onClick={() => handleEditProduct(item)}
                        className="p-2 bg-white hover:bg-orange-50 text-gray-500 hover:text-[#b3360c] border border-gray-150 rounded-lg transition" 
                        title="Edit product parameters"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(item)}
                        className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-650 border border-red-50 rounded-lg transition"
                        title="Delete product permanent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dotted Plus Placeholder Card */}
          <div 
            onClick={handleStartWizard}
            className="border-2 border-dashed border-gray-200 hover:border-[#b3360c] bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center cursor-pointer group transition-all duration-300 h-68"
          >
            <div className="w-12 h-12 rounded-full bg-gray-55 group-hover:bg-[#b3360c]/5 text-gray-400 group-hover:text-[#b3360c] flex items-center justify-center border border-gray-100 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            
            <h4 className="font-extrabold text-[#121d21] text-xs uppercase mt-4 tracking-wider">New Item</h4>
            <p className="text-gray-400 text-[11px] mt-1 max-w-[150px]">Click to start the product creation wizard.</p>
          </div>
        </div>
      </div>

      {/* MODERN CREATE CATEGORY MODAL POPUP */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCreatingCategory && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body Card */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-[32px] border border-gray-150 p-8 w-full max-w-md shadow-2xl relative z-10 mx-4 overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isCreatingCategory}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-450 hover:text-gray-700 transition cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-950 tracking-tight">Create New Category</h3>
                  <p className="text-gray-400 text-xs font-semibold mt-1">Organize your menus by creating a custom product category.</p>
                </div>

                {modalError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {modalError}
                  </div>
                )}

                {modalSuccess && (
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    {modalSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black font-mono tracking-wider text-gray-450 uppercase">Category Name</label>
                    <input 
                      required
                      autoFocus
                      type="text" 
                      placeholder="e.g. Signature Burgers, Drinks, Appetizers" 
                      value={newCategoryName}
                      disabled={isCreatingCategory}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-[#b3360c] font-semibold text-gray-800 transition"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isCreatingCategory}
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-55 hover:bg-gray-100 border border-gray-150 text-gray-700 py-3.5 rounded-xl font-bold transition text-xs uppercase tracking-wider cursor-pointer text-center disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      className="flex-1 bg-[#b3360c] hover:bg-[#942a08] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {isCreatingCategory ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>Create Category</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
