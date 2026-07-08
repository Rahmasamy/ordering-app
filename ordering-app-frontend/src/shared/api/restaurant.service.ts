import api from './api-client';

export interface RestaurantResponse {
  id: number;
  name: string;
  logoURL?: string;
  ownerId?: number;
  status?: string;
  primaryCountry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

export const restaurantService = {
  getAll: async (): Promise<RestaurantResponse[]> => {
    const response = await api.get('/restaurants');
    return response.data.data;
  },

  getById: async (id: number | string): Promise<RestaurantResponse> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data.data;
  },

  getNearby: async (lat: number, lng: number): Promise<RestaurantResponse[]> => {
    const response = await api.get('/restaurants/nearby', {
      params: { lat, lng }
    });
    return response.data.data;
  },

  getGlobalCategories: async (): Promise<CategoryResponse[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  getBranches: async (restaurantId: number | string): Promise<any[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/branches`);
    const data = response.data.data || [];
    return data.map((b: any) => ({
      ...b,
      name: b.label || b.name || '',
      address: b.address_text || b.address || ''
    }));
  },

  createBranch: async (restaurantId: number | string, data: {
    countryCode: string;
    label: string;
    addressText: string;
    lat: number;
    lng: number;
    opensAt: string;
    closesAt: string;
    deliveryRadius: number;
    currency: string;
  }): Promise<any> => {
    const response = await api.post(`/restaurants/${restaurantId}/branches`, data);
    return response.data.data;
  },

  updateBranch: async (branchId: number | string, data: {
    label?: string;
    addressText?: string;
    lat?: number;
    lng?: number;
    opensAt?: string;
    closesAt?: string;
    deliveryRadius?: number;
    currency?: string;
    acceptOrders?: boolean;
  }): Promise<any> => {
    const response = await api.patch(`/branches/${branchId}`, data);
    return response.data.data;
  }
};
