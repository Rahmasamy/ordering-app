import { useState, useCallback } from 'react';
import { cartService, AddCartItemPayload } from '../api/cart.service';
import { useAppState } from '@/app/providers/StateContext';
import { CartItem } from '../types/global.types';

export function useCart() {
  const [cartData, setCartData] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { setCart } = useAppState();

  const fetchCart = useCallback(async () => {
    try {
      setIsCartLoading(true);
      const data = await cartService.getCart();
      setCartData(data);

      if (data && data.items) {
        const mapped: CartItem[] = data.items.map((item: any) => ({
          id: String(item.id),
          product: {
            id: String(item.product.id),
            name: item.product.name,
            price: parseFloat(item.unitPrice), // use DB price directly
            description: '',
            category: 'mains',
            tags: [],
            sku: '',
            stockStatus: 'In Stock',
            warningThreshold: 10,
            taxable: true,
            taxCategory: 'Standard Food (8%)',
            branchAvailability: {},
            fulfillmentOptions: { dineIn: true, takeaway: true, delivery: true },
            allergenWarnings: '',
            rating: 5,
            reviewsCount: 1,
            image: item.product.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            donenessOptions: [],
            addons: [],
            restaurantId: item.product.restaurantId ? Number(item.product.restaurantId) : undefined,
          },
          quantity: item.quantity,
          totalPrice: item.subtotal, // use subtotal directly
          selectedDoneness: item.selectedDoneness || undefined,
          selectedAddons: item.selectedAddons || [],
        }));
        setCart(mapped);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setIsCartLoading(false);
    }
  }, [setCart]);

  const addToCart = async (payload: AddCartItemPayload) => {
    try {
      setIsAdding(true);
      await cartService.addItem(payload);
      await fetchCart();
      setIsCartOpen(true);
    } catch (err) {
      console.error('Failed to add to cart', err);
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await cartService.removeItem(productId);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove item', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (err) {
      console.error('Failed to clear cart', err);
      throw err;
    }
  };

  return {
    cartData,
    isCartOpen,
    setIsCartOpen,
    isCartLoading,
    isAdding,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart
  };
}

