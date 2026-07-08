import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FoodItem, Branch, CartItem, DashboardMetrics, ActivityLog } from '@/shared/types/global.types';
import { INITIAL_FOOD_ITEMS, INITIAL_BRANCHES, INITIAL_METRICS } from '@/shared/lib/utils';

interface StateContextType {
  foodItems: FoodItem[];
  branches: Branch[];
  cart: CartItem[];
  metrics: DashboardMetrics;
  selectedProductId: string | null;
  wizardStep: number;
  newProductForm: Partial<FoodItem>;
  setFoodItems: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setMetrics: React.Dispatch<React.SetStateAction<DashboardMetrics>>;
  setSelectedProductId: (id: string | null) => void;
  setWizardStep: React.Dispatch<React.SetStateAction<number>>;
  setNewProductForm: React.Dispatch<React.SetStateAction<Partial<FoodItem>>>;
  addProduct: (product: FoodItem) => void;
  deleteProduct: (id: string) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartLineId: string) => void;
  clearCart: () => void;
  toggleBranchAvailability: (branchId: string) => void;
  addActivityLog: (user: string, action: string, type: 'update' | 'alert' | 'status', details?: string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [selectedProductId, setSelectedProductId] = useState<string | null>('f1');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [newProductForm, setNewProductForm] = useState<Partial<FoodItem>>({
    name: '',
    price: 0,
    description: '',
    category: 'mains',
    tags: [],
    sku: '',
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
      { name: 'Extra Truffle Mayo', price: 2.50 },
      { name: 'Caramelized Onions', price: 1.50 },
      { name: 'No Onions', price: 0.00 },
    ],
  });

  const addProduct = (product: FoodItem) => {
    setFoodItems((prev) => [product, ...prev]);
    addActivityLog('Merchant Pro System', `Created new menu item: ${product.name}`, 'update', `SKU: ${product.sku} - base price $${product.price.toFixed(2)}`);
  };

  const deleteProduct = (id: string) => {
    setFoodItems((prev) => prev.filter((item) => item.id !== id));
    addActivityLog('Merchant Pro System', 'Removed menu item', 'alert', `Item ID: ${id}`);
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) =>
          c.product.id === item.product.id &&
          c.selectedDoneness === item.selectedDoneness &&
          JSON.stringify(c.selectedAddons.sort()) === JSON.stringify(item.selectedAddons.sort())
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += item.quantity;
        const addonsCost = item.product.addons
          ? item.product.addons
              .filter((a) => item.selectedAddons.includes(a.name))
              .reduce((sum, current) => sum + current.price, 0)
          : 0;
        next[existingIndex].totalPrice = next[existingIndex].quantity * (item.product.price + addonsCost);
        return next;
      }

      const uniqueId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      return [...prev, { ...item, id: uniqueId } as CartItem];
    });
  };

  const removeFromCart = (cartLineId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartLineId));
  };

  const clearCart = () => setCart([]);

  const toggleBranchAvailability = (branchId: string) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          const nextOpen = !b.isOpen;
          addActivityLog(
            'Branch Manager',
            `${b.name} is now ${nextOpen ? 'Open (Online)' : 'Offline (Maintenance)'}.`,
            nextOpen ? 'status' : 'alert',
            `Staff count: ${b.activeStaff}/${b.totalStaff}`
          );
          return { ...b, isOpen: nextOpen, revenue: nextOpen ? b.revenue : 0 };
        }
        return b;
      })
    );
  };

  const addActivityLog = (user: string, action: string, type: 'update' | 'alert' | 'status', details = '') => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      time: 'Just now',
      user,
      action,
      details,
      type,
    };
    setMetrics((prev) => ({
      ...prev,
      activityLogs: [newLog, ...prev.activityLogs.slice(0, 10)],
    }));
  };

  return (
    <StateContext.Provider
      value={{
        foodItems,
        branches,
        cart,
        metrics,
        selectedProductId,
        wizardStep,
        newProductForm,
        setFoodItems,
        setBranches,
        setCart,
        setMetrics,
        setSelectedProductId,
        setWizardStep,
        setNewProductForm,
        addProduct,
        deleteProduct,
        addToCart,
        removeFromCart,
        clearCart,
        toggleBranchAvailability,
        addActivityLog,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
}
