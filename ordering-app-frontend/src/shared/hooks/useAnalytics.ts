import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../api/analytics.service';

export function useAnalyticsOverview(restaurantId: number | string | undefined) {
  return useQuery({
    queryKey: ['analyticsOverview', restaurantId],
    queryFn: () => analyticsService.getOverview(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time overview updates
  });
}
