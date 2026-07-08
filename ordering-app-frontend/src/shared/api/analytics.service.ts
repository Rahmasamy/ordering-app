import api from './api-client';
import { DashboardMetrics } from '@/shared/types/global.types';

export const analyticsService = {
  getOverview: async (restaurantId: number | string): Promise<DashboardMetrics> => {
    const response = await api.get(`/restaurants/${restaurantId}/analytics/overview`);
    return response.data.data;
  }
};
