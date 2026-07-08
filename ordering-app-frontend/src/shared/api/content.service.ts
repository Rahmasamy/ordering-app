import api from './api-client';

export interface ChefResponse {
  id: number;
  name: string;
  title: string;
  imageUrl: string | null;
  quote: string | null;
}

export interface StoryResponse {
  id: number;
  title: string;
  content: string;
  featuredQuote: string | null;
  productId: number | null;
  restaurantId: number | null;
  chefId: number | null;
  chef?: ChefResponse | null;
}

export interface IngredientResponse {
  id: number;
  name: string;
  description: string | null;
  productId: number;
  sortOrder: number;
}

export interface TestimonialResponse {
  id: number;
  content: string;
  rating: number | null;
  authorName: string | null;
  productId: number | null;
  restaurantId: number | null;
  createdAt: string;
}

export interface ProductContentResponse {
  story: StoryResponse | null;
  ingredients: IngredientResponse[];
  testimonials: TestimonialResponse[];
}

export const contentService = {
  getProductContent: async (productId: number | string): Promise<ProductContentResponse> => {
    const response = await api.get(`/products/${productId}/content`);
    return response.data.data;
  },

  getProductTestimonials: async (productId: number | string): Promise<TestimonialResponse[]> => {
    const response = await api.get(`/products/${productId}/testimonials`);
    return response.data.data || [];
  },

  getRestaurantTestimonials: async (restaurantId: number | string): Promise<TestimonialResponse[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/testimonials`);
    return response.data.data || [];
  },
};
