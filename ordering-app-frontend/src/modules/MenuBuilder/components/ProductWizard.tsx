import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { FoodItem } from '@/shared/types/global.types';
import { ChevronLeft, UploadCloud, Trash2, Shield, Info, ArrowRight, ToggleLeft, ToggleRight, Check, AlertCircle, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCreateProduct } from '@/shared/hooks/useCreateProduct';
import { productService } from '@/shared/api/product.service';
import { restaurantService } from '@/shared/api/restaurant.service';

export default function ProductWizard() {
  const navigate = useNavigate();
  const { 
    wizardStep, 
    setWizardStep, 
    newProductForm, 
    setNewProductForm, 
    addProduct 
  } = useAppState();

  const { user } = useAuthStore();
  const createProductMutation = useCreateProduct();
  const [categories, setCategories] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    productService.getRestaurantCategories().then(setCategories).catch(console.error);
    if (user?.restaurantId) {
      restaurantService.getBranches(user.restaurantId).then(setBranches).catch(console.error);
    }
  }, [user?.restaurantId]);

  useEffect(() => {
    if (categories.length > 0 && !newProductForm.category) {
      setNewProductForm(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, newProductForm.category, setNewProductForm]);

  useEffect(() => {
    if (branches.length > 0) {
      setNewProductForm(prev => {
        const hasMockIds = prev.branchAvailability && (prev.branchAvailability.b1 || prev.branchAvailability.b2);
        const isEmpty = !prev.branchAvailability || Object.keys(prev.branchAvailability).length === 0;
        if (isEmpty || hasMockIds) {
          const initialAvailability: Record<string, boolean> = {};
          branches.forEach(b => {
            initialAvailability[String(b.id)] = true;
          });
          return { ...prev, branchAvailability: initialAvailability };
        }
        return prev;
      });
    }
  }, [branches, setNewProductForm]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!newProductForm.name?.trim()) errs.name = 'Product name is required';
      if (!newProductForm.price || newProductForm.price <= 0) errs.price = 'Base price must be positive';
      if (!newProductForm.description?.trim()) errs.description = 'Description is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(wizardStep)) {
      setWizardStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setWizardStep((prev) => Math.max(1, prev - 1));
  };

  const handleCancel = () => {
    if (confirm('Cancel and discard product creation? All draft steps will be lost.')) {
      navigate('/merchant/catalog');
    }
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = newProductForm.tags || [];
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setNewProductForm((prev) => ({ ...prev, tags: nextTags }));
  };

  const handleFulfillmentToggle = (key: 'dineIn' | 'takeaway' | 'delivery') => {
    const options = newProductForm.fulfillmentOptions || { dineIn: true, takeaway: true, delivery: true };
    setNewProductForm((prev) => ({
      ...prev,
      fulfillmentOptions: {
        ...options,
        [key]: !options[key],
      },
    }));
  };

  const handleBranchToggle = (branchId: string) => {
    const availability = newProductForm.branchAvailability || {};
    setNewProductForm((prev) => ({
      ...prev,
      branchAvailability: {
        ...availability,
        [branchId]: !availability[branchId],
      },
    }));
  };

  const handlePublish = async () => {
    if (!user?.restaurantId) {
      alert("Error: No restaurant associated with your account.");
      return;
    }
    setIsPublishing(true);
    try {
      const isGlutenFree = newProductForm.tags?.includes('Gluten-Free') || false;
      const isVegan = newProductForm.tags?.includes('Vegan') || false;
      const isDairyFree = newProductForm.tags?.includes('Dairy-Free') || isVegan;
      const isTrending = newProductForm.tags?.includes('Vegan') || false;

      const response = await createProductMutation.mutateAsync({
        restaurantId: Number(user.restaurantId),
        data: {
          name: newProductForm.name || 'Unnamed product',
          description: newProductForm.description || 'Tasty fresh gourmet dish configured by our branch chef.',
          imageUrl: newProductForm.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
          categoryName: newProductForm.category || 'Mains',
          isTrending,
          isChefSpecial: false,
          isPopular: false,
          calories: 450,
          isDairyFree,
          containsGluten: !isGlutenFree,
          imageUrls: [],
          donenessOptions: [],
          addons: [],
          stock: newProductForm.stock !== undefined ? newProductForm.stock : 100,
          isAvailable: newProductForm.isAvailable !== false
        }
      });

      const createdProduct = response.product;
      const productId = createdProduct.id;

      // Update branch details for each selected branch
      const availability = newProductForm.branchAvailability || {};
      const selectedBranchIds = Object.keys(availability).filter(id => !!availability[id]);
      const validBranchIds = branches.map(b => Number(b.id));

      for (const branchIdStr of selectedBranchIds) {
        const branchId = Number(branchIdStr);
        if (!isNaN(branchId) && validBranchIds.includes(branchId)) {
          // Call updateProduct endpoint to apply price/availability for this branch
          await productService.updateProduct(productId, {
            price: Math.round(Number(newProductForm.price) || 0),
            stock: 100,
            isAvailable: true
          }, branchId);
        }
      }

      alert(`Published ${createdProduct.name} successfully to your active branch catalog!`);
      
      // Clear wizard form state
      setNewProductForm({
        name: '',
        price: 0,
        description: '',
        category: 'Mains',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        tags: [],
        sku: '',
        stockStatus: 'In Stock',
        warningThreshold: 10,
        taxable: true,
        taxCategory: 'Standard Food (8%)',
        branchAvailability: {},
        fulfillmentOptions: { dineIn: true, takeaway: true, delivery: true },
        allergenWarnings: ''
      });
      setWizardStep(1);

      navigate('/merchant/catalog');
    } catch (err: any) {
      console.error("Failed to create product:", err);
      alert(`Failed to create product: ${err.message || 'Unknown error'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Mock upload action
  const handleMockUpload = () => {
    const imageUrl = prompt(
      "Paste any high-resolution Food Image URL for your menu item:",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80"
    );
    if (imageUrl) {
      setNewProductForm((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  return (
    <div className="bg-[#e9eded]/30 min-h-[calc(100vh-140px)] rounded-[36px] overflow-hidden border border-gray-200/50 shadow-sm grid grid-cols-1 lg:grid-cols-12">
      
      {/* Left Sidebar Brand Info Block - Aligned with Screen 7/8 orange column */}
      <div className="lg:col-span-4 bg-[#c23e11] text-white p-8 md:p-10 flex flex-col justify-between min-h-[300px] lg:min-h-[500px]">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-lg bg-white text-[#c23e11] font-black flex items-center justify-center text-sm shadow-md">OF</span>
            <span className="font-black text-lg tracking-wider">OrderFlow</span>
          </div>

          <h3 className="text-xl md:text-2xl font-black mb-4 leading-tight max-w-xs">
            Precision tools for high-velocity culinary entrepreneurship.
          </h3>
          <p className="text-white/80 text-xs md:text-sm font-medium leading-relaxed max-w-xs">
            Define your essence. Configure branch menus, manage instant stock thresholds, and align tax metrics in real time.
          </p>
        </div>

        {/* Pro tip matching mockup */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 mt-8">
          <span className="font-extrabold text-[10px] uppercase tracking-widest text-amber-200 block mb-2">PRO TIP</span>
          <p className="text-white/90 text-xs leading-relaxed font-semibold">
            Clear names and descriptions help customers decide faster during peak rush hours.
          </p>
        </div>
      </div>

      {/* Right Column Interactive Panel containing the wizard pages */}
      <div className="lg:col-span-8 bg-white p-6 md:p-10 flex flex-col justify-between">
        
        {/* Steps header navigator */}
        <div>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-6 border-b border-gray-100 scrollbar-none mb-8">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Brand Assets' },
              { num: 3, label: 'Business Details' },
              { num: 4, label: 'Review' },
            ].map((s) => {
              const worksOn = wizardStep === s.num;
              const completed = wizardStep > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 ${
                    worksOn 
                      ? 'bg-[#c23e11] text-white shadow-md' 
                      : completed 
                        ? 'bg-green-150 text-green-700 font-extrabold' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {completed ? '✓' : s.num}
                  </div>
                  <span className={`text-xs font-extrabold ${worksOn ? 'text-[#c23e11]' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                  {s.num < 4 && <div className="w-8 h-px bg-gray-150" />}
                </div>
              );
            })}
          </div>

          {/* Form Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={wizardStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* PAGE 1: BASIC INFORMATION (Screen 7/8 content) */}
              {wizardStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-950">Basic Information</h3>
                    <p className="text-gray-400 text-xs font-semibold mt-1">Start by giving your new product a name and defining its core attributes.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Product Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Signature Truffle Burger"
                        value={newProductForm.name || ''}
                        onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full bg-white border rounded-xl p-3.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#c23e11] ${
                          errors.name ? 'border-red-500 bg-red-550/10' : 'border-gray-200'
                        }`}
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1">⚠ {errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Category</label>
                        <select 
                          value={newProductForm.category || (categories.length > 0 ? categories[0].name : 'Mains')}
                          onChange={(e) => setNewProductForm(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs font-bold text-gray-700 outline-none focus:border-[#c23e11] cursor-pointer"
                        >
                          {categories.length > 0 ? (
                            categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Mains">Mains</option>
                              <option value="Appetizers">Appetizers</option>
                              <option value="Drinks">Drinks</option>
                              <option value="Desserts">Desserts</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Base Price (as in DB)</label>
                        <input 
                          type="number" 
                          step="1"
                          placeholder="e.g. 1299"
                          value={newProductForm.price || ''}
                          onChange={(e) => setNewProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className={`w-full bg-white border rounded-xl p-3.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#c23e11] ${
                            errors.price ? 'border-red-500 bg-red-550/10' : 'border-gray-200'
                          }`}
                        />
                        {errors.price && <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1">⚠ {errors.price}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                      <textarea 
                        rows={4}
                        placeholder="Describe the flavors, ingredients, and soul of this product..."
                        value={newProductForm.description || ''}
                        onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full bg-white border rounded-xl p-3.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#c23e11] resize-none ${
                          errors.description ? 'border-red-500 bg-red-550/10' : 'border-gray-200'
                        }`}
                      />
                      {errors.description && <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1">⚠ {errors.description}</p>}
                    </div>

                    {/* Auto-saved info banner matching mock */}
                    <div className="bg-[#eff6ff] p-4 rounded-xl border border-[#dbeafe] flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-gray-600 text-xs">
                        Your changes are automatically saved as a draft. You can come back and finish this setup anytime before publishing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: BRAND ASSETS / DIETARY TAGS (Screen 2 components) */}
              {wizardStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left Column product media */}
                  <div className="md:col-span-7 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-950">Product Media</h3>
                      <p className="text-gray-400 text-xs font-semibold mt-1">Define your visual identity and photo credentials.</p>
                    </div>

                    {/* Upload visual dotted box block */}
                    <div 
                      onClick={handleMockUpload}
                      className="border-2 border-dashed border-gray-200 hover:border-[#c23e11] rounded-2xl p-6 text-center cursor-pointer bg-gray-50 group transition duration-200"
                    >
                      <UploadCloud className="w-10 h-10 text-gray-450 mx-auto group-hover:scale-105 transition-transform" />
                      <p className="text-gray-800 text-xs font-bold mt-3">Drag and drop assets here</p>
                      <p className="text-gray-400 text-[10px] mt-1">Upload high-resolution PNG or JPG. Recommended size 1200×800px.</p>
                      
                      <button 
                        type="button"
                        className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-150 rounded-lg text-[10px] font-extrabold px-4 py-2 mt-4 inline-block transition cursor-pointer shadow-xs"
                      >
                        Browse Files
                      </button>
                    </div>

                    {/* Live Preview card render matching Screen 2 bottom left */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono tracking-widest text-[#c23e11] font-black uppercase">Live Preview</label>
                      <div className="relative rounded-2xl h-52 overflow-hidden shadow-md">
                        <img 
                          src={newProductForm.image} 
                          alt="Live Preview Frame" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 bg-[#c23e11] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                          Live Preview
                        </div>
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <h4 className="text-white font-extrabold text-sm">{newProductForm.name || 'Signature Truffle Burger'}</h4>
                          <p className="text-gray-200/90 text-[10px] font-medium mt-1">Draft Preview: Ready for high-velocity delivery.</p>
                        </div>

                        {/* Delete asset mock icon button */}
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewProductForm(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' }));
                          }}
                          className="absolute right-4 top-4 bg-white/95 text-gray-700 p-2 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-505 hover:text-red-650" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column dietary checkbox checklist */}
                  <div className="md:col-span-5 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-950">Dietary Tags</h3>
                      <p className="text-gray-400 text-xs font-semibold mt-1">Select tags to help digital clients filter menus.</p>
                    </div>

                    <div className="space-y-2.5">
                      {['Vegan', 'Gluten-Free', 'Spicy', 'Vegetarian', 'Pescatarian', 'Nut-Free'].map((tag) => {
                        const isChecked = (newProductForm.tags || []).includes(tag);
                        return (
                          <div
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              isChecked
                                ? 'bg-[#c23e11]/5 border-[#c23e11] text-[#c23e11] font-bold'
                                : 'bg-white border-gray-150 hover:bg-gray-52 text-gray-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-[#c23e11] border-[#c23e11]' : 'border-gray-300'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs">{tag}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Allergen Warnings (Optional)</label>
                      <textarea 
                        rows={3}
                        placeholder="e.g. Prepared in a facility that also processes shellfish..."
                        value={newProductForm.allergenWarnings || ''}
                        onChange={(e) => setNewProductForm(prev => ({ ...prev, allergenWarnings: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-[#c23e11] resize-none"
                      />
                    </div>

                    {/* Growth Tip panel on right bottom */}
                    <div className="bg-[#121d21] text-white p-5 rounded-2xl">
                      <div className="flex gap-2 text-orange-400">
                        <Sparkles className="w-5 h-5 flex-shrink-0" />
                        <span className="font-extrabold text-[10px] uppercase font-mono tracking-wider">Growth Tip</span>
                      </div>
                      <p className="text-gray-300 text-[10.5px] leading-relaxed mt-2.5 font-medium">
                        Products with clear dietary tags and high-quality photography see an average conversion lift of <span className="text-white font-extrabold">24% in the first week</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                       {/* PAGE 3: DIGITAL SETTINGS & REAL BRANCH AVAILABILITY (Screen 3) */}
              {wizardStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left Column branch list */}
                  <div className="md:col-span-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-950">Branch Availability</h3>
                      <p className="text-gray-400 text-xs font-semibold mt-1">Configure active branches mapping.</p>
                    </div>

                    <div className="space-y-3">
                      {branches.map((branch) => {
                        const isAvailable = !!(newProductForm.branchAvailability || {})[branch.id];
                        return (
                          <div 
                            key={branch.id} 
                            onClick={() => handleBranchToggle(branch.id)}
                            className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex items-center justify-between cursor-pointer hover:border-gray-250 transition"
                          >
                            <div>
                              <span className="font-bold text-xs text-gray-900 block">{branch.name}</span>
                              <span className="text-gray-400 text-[10px] mt-0.5 block font-medium">{branch.address}</span>
                            </div>

                            <button 
                              type="button"
                              className={`text-[#c23e11] hover:text-[#942a08] flex-shrink-0`}
                            >
                              {isAvailable ? (
                                <div className="w-10 h-6 bg-[#c23e11] rounded-full p-0.5 flex justify-end items-center">
                                  <div className="w-5 h-5 bg-white rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-10 h-6 bg-gray-200 rounded-full p-0.5 flex justify-start items-center">
                                  <div className="w-5 h-5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                      {branches.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No active branches found for this restaurant.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column details - Product level Stock and Availability */}
                  <div className="md:col-span-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-950">Product Inventory & Status</h3>
                      <p className="text-gray-400 text-xs font-semibold mt-1">Configure global product stock and availability.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Base Stock Level</label>
                        <div className="flex border border-gray-150 rounded-xl overflow-hidden focus-within:border-[#c23e11]">
                          <input 
                            type="number" 
                            value={newProductForm.stock !== undefined ? newProductForm.stock : 100}
                            onChange={(e) => setNewProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                            className="w-full bg-white p-3 text-xs font-semibold text-gray-850 outline-none focus:border-[#c23e11]"
                            placeholder="100"
                          />
                          <span className="bg-gray-100 flex items-center px-3.5 text-[10px] uppercase font-bold text-gray-500 font-mono">Units</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white p-5 border border-gray-150 rounded-2xl">
                        <div>
                          <span className="font-bold text-xs text-gray-900 block">Product Availability</span>
                          <span className="text-gray-400 text-[10px] block font-semibold">Enable or disable ordering for this product globally.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewProductForm(prev => ({ ...prev, isAvailable: prev.isAvailable !== false ? false : true }))}
                          className={`text-[#c23e11] hover:text-[#942a08] flex-shrink-0`}
                        >
                          {newProductForm.isAvailable !== false ? (
                            <div className="w-10 h-6 bg-[#c23e11] rounded-full p-0.5 flex justify-end items-center">
                              <div className="w-5 h-5 bg-white rounded-full"></div>
                            </div>
                          ) : (
                            <div className="w-10 h-6 bg-gray-200 rounded-full p-0.5 flex justify-start items-center">
                              <div className="w-5 h-5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 4: DETAILED CONFIRMATION SUMMARY */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-905">Review & Publish Product</h3>
                    <p className="text-gray-400 text-xs font-semibold mt-1">Double check configured details before deploying permanently to digital menus.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-150">
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Product Name</span>
                        <p className="text-sm font-black text-gray-900">{newProductForm.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Base Price</span>
                          <p className="text-xs font-mono font-extrabold text-[#c23e11]">{newProductForm.price}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Category</span>
                          <p className="text-xs font-extrabold text-gray-800 capitalize">{newProductForm.category}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider font-mono">Base Stock Level</span>
                        <p className="text-xs font-mono font-bold text-gray-700 bg-white p-2 border rounded-md">{newProductForm.stock !== undefined ? newProductForm.stock : 100} Units</p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Global Availability</span>
                        <p className="text-xs font-bold text-gray-700 bg-white p-2 border rounded-md">
                          {newProductForm.isAvailable !== false ? '✅ Active / In Catalog' : '❌ Inactive / Hidden'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Dietary Class</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {newProductForm.tags && newProductForm.tags.length > 0 ? (
                            newProductForm.tags.map(t => (
                              <span key={t} className="text-[9px] bg-[#c23e11]/10 text-[#c23e11] font-bold px-2 py-0.5 rounded">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-gray-400">No specific identifiers selected</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Visual Asset Uploaded</span>
                        <div className="relative rounded-xl overflow-hidden h-36 mt-1 border border-gray-200">
                          <img 
                            src={newProductForm.image} 
                            alt="Final Product" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Fulfillment Branches</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Available at: {
                            Object.keys(newProductForm.branchAvailability || {})
                              .filter(id => !!newProductForm.branchAvailability?.[id])
                              .map(id => branches.find(b => Number(b.id) === Number(id))?.name || `Branch #${id}`)
                              .join(', ') || 'No branches selected'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-semibold text-emerald-900">
                      Validation passes. Deploying this product will automatically sync with active digital kitchen displays across selected branches.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Footer controls */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
          <button 
            type="button"
            onClick={wizardStep === 1 ? handleCancel : handleBack}
            className="text-gray-500 hover:text-gray-800 font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            {wizardStep === 1 ? 'Cancel Setup' : 'Back to predecessor'}
          </button>

          <div className="flex items-center gap-3">
            {wizardStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#c23e11] hover:bg-[#a0310c] transition text-white px-7 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer shadow-lg shadow-red-950/10 flex items-center gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 transition disabled:opacity-60 text-white px-7 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Menu Item</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
