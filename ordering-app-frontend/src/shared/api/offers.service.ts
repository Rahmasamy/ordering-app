import api from './api-client';

export interface OfferResponse {
  id: number;
  badgeText: string;
  imageUrl: string;
  title: string;
  description: string;
  promoCode: string;
  expiresAt: string;
  productId: number | null;
  restaurantId: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListOffersParams {
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const offersService = {
  getAll: async (params?: ListOffersParams): Promise<{ data: OfferResponse[]; meta?: Record<string, unknown> }> => {
    const response = await api.get('/offers', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta,
    };
  },

  getById: async (id: number | string): Promise<OfferResponse> => {
    const response = await api.get(`/offers/${id}`);
    return response.data.data;
  },

  getByProduct: async (productId: number | string): Promise<OfferResponse[]> => {
    const response = await api.get(`/products/${productId}/offers`);
    return response.data.data || [];
  },

  getByRestaurant: async (restaurantId: number | string): Promise<OfferResponse[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/offers`);
    return response.data.data || [];
  },
};
