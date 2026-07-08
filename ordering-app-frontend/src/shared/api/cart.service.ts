import api from './api-client';

export interface AddCartItemPayload {
  productId: number;
  quantity?: number;
  selectedDoneness?: string;
  selectedAddons?: string[];
}

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  addItem: async (payload: AddCartItemPayload) => {
    const response = await api.post('/cart/items', payload);
    return response.data.data;
  },

  removeItem: async (productId: number) => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data.data;
  }
};
