import { useState, useEffect, useCallback } from 'react';
import { offersService, OfferResponse } from '../api/offers.service';
import { restaurantService, RestaurantResponse } from '../api/restaurant.service';

export function useOffers() {
  const [offers, setOffers] = useState<OfferResponse[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [offersResult, restaurantsData] = await Promise.all([
        offersService.getAll({ limit: 50, sortBy: 'expiresAt', sortOrder: 'asc' }),
        restaurantService.getAll(),
      ]);
      setOffers(offersResult.data);
      setRestaurants(restaurantsData);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to load offers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const getRestaurantName = useCallback((restaurantId: number | null): string => {
    if (!restaurantId) return 'Partner Restaurant';
    const restaurant = restaurants.find((r) => Number(r.id) === Number(restaurantId));
    return restaurant?.name || 'Partner Restaurant';
  }, [restaurants]);

  return { offers, isLoading, error, refetch: loadOffers, getRestaurantName };
}
