import api from './api-client';

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  restaurantId: number;
  categoryId: number;
  isTrending: boolean;
  isChefSpecial?: boolean;
  isPopular?: boolean;
  calories?: number;
  isDairyFree?: boolean;
  containsGluten?: boolean;
  reviewsCount?: number;
  rating?: number;
  imageUrls?: string[];
  donenessOptions?: string[];
  addons?: { name: string; price: number }[];
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListProductsParams {
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  restaurantId?: number;
  isTrending?: boolean;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

export const productService = {
  getAll: async (params?: ListProductsParams): Promise<{ data: ProductResponse[]; meta?: any }> => {
    const response = await api.get('/products', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta
    };
  },

  getById: async (id: number | string): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  getTrending: async (limit?: number): Promise<ProductResponse[]> => {
    const response = await api.get('/products/trending', {
      params: { limit }
    });
    return response.data.data || [];
  },

  createProduct: async (restaurantId: number, data: any): Promise<{ message: string; product: ProductResponse }> => {
    const response = await api.post(`/restaurants/${restaurantId}/products`, data);
    return response.data.data;
  },

  updateProduct: async (id: number, data: any, branchId?: number): Promise<ProductResponse> => {
    const response = await api.patch(`/products/${id}`, data, {
      params: branchId ? { branchId } : undefined
    });
    return response.data.data;
  },

  getRestaurantCategories: async (): Promise<CategoryResponse[]> => {
    const response = await api.get('/restaurant/categories');
    return response.data.data || [];
  },

  createCategory: async (name: string): Promise<{ message: string; category: CategoryResponse }> => {
    const response = await api.post('/restaurant/categories', { name });
    return response.data.data;
  },

  getRestaurantProducts: async (restaurantId: number | string): Promise<ProductResponse[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/products`);
    return response.data.data || [];
  }
};
