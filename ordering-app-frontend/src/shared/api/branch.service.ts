import api from './api-client';

export interface BranchResponse {
  id: string;
  name: string;
  restaurantId: string;
  latitude: number;
  longitude: number;
  address?: string;
  time?: string;
  rating?: number;
  restaurant?: {
    name: string;
    logoUrl?: string;
  };
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  isChefSpecial?: boolean;
}

export const branchService = {
  getNearby: async (latitude: number, longitude: number): Promise<BranchResponse[]> => {
    const response = await api.get('/branches/nearby', {
      params: { latitude, longitude }
    });
    return response.data.data;
  },

  getBranchProducts: async (branchId: string): Promise<ProductResponse[]> => {
    const response = await api.get(`/branches/${branchId}/products`);
    return response.data.data;
  }
};
