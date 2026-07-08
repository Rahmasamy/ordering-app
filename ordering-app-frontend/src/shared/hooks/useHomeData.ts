import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '../api/restaurant.service';
import { productService } from '../api/product.service';

export function useHomeData() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbTrendingProducts, setDbTrendingProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);

  // Helper to map category icons
  const getCategoryIcon = (category: string): string => {
    const cat = category.toLowerCase();
    if (cat.includes('burger') || cat.includes('fast')) return '🍔';
    if (cat.includes('salad') || cat.includes('healthy')) return '🥗';
    if (cat.includes('dessert') || cat.includes('sweet')) return '🍰';
    if (cat.includes('coffee') || cat.includes('drink')) return '☕';
    if (cat.includes('pizza') || cat.includes('italian')) return '🍕';
    return '🍽️';
  };

  // Fetch products globally with optional cursor
  const fetchGlobalProducts = useCallback(async (cursor?: string, clearPrevious = false) => {
    try {
      setIsFetchingNextPage(!!cursor);
      const limit = 8;
      const { data: productsData, meta } = await productService.getAll({ limit, cursor });
      
      if (clearPrevious || !cursor) {
        setDbProducts(productsData);
      } else {
        setDbProducts(prev => {
          const prevIds = new Set(prev.map(p => p.id.toString()));
          const newItems = productsData.filter(p => !prevIds.has(p.id.toString()));
          return [...prev, ...newItems];
        });
      }
      setNextCursor(meta?.nextCursor || null);
      setHasMore(meta?.hasMore || false);
    } catch (err: any) {
      console.error('Error fetching global products:', err);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, []);

  // Initial load
  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let lat = 30.0444;
      let lng = 31.2357;

      const fetchNearbyAndAll = async (latitude: number, longitude: number) => {
        try {
          // 1. Fetch nearby restaurants
          const nearbyRes = await restaurantService.getNearby(latitude, longitude);
          setNearbyRestaurants(nearbyRes);

          // 2. Fetch all restaurants
          const allRes = await restaurantService.getAll();
          setRestaurants(allRes);

          // 3. Fetch global categories list
          const categoriesData = await restaurantService.getGlobalCategories();
          const filteredCategories = categoriesData.filter((cat: any) => cat.name.toLowerCase() !== 'trending');
          const mappedCategories = [
            { id: -1, name: 'All', icon: '🍽️' },
            { id: 0, name: 'Trending', icon: '🔥' },
            ...filteredCategories.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              icon: getCategoryIcon(cat.name)
            }))
          ];
          setDbCategories(mappedCategories);

          // 4. Fetch trending products
          const trendingData = await productService.getTrending(4);
          setDbTrendingProducts(trendingData);

          // 5. Fetch first page of products globally
          await fetchGlobalProducts(undefined, true);

          // 6. Set first nearby restaurant as active by default (e.g. for styling or info, but not restricting products)
          if (nearbyRes.length > 0) {
            setActiveRestaurantId(Number(nearbyRes[0].id));
          } else if (allRes.length > 0) {
            setActiveRestaurantId(Number(allRes[0].id));
          }
        } catch (err: any) {
          console.error('Inner fetch error:', err);
          throw err;
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            await fetchNearbyAndAll(lat, lng);
            setIsLoading(false);
          },
          async () => {
            await fetchNearbyAndAll(lat, lng);
            setIsLoading(false);
          }
        );
      } else {
        await fetchNearbyAndAll(lat, lng);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to fetch Home data:', err);
      setError(err.message || 'Failed to load home page data');
      setIsLoading(false);
    }
  }, [fetchGlobalProducts]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const fetchNextPage = useCallback(() => {
    if (nextCursor && !isFetchingNextPage) {
      fetchGlobalProducts(nextCursor);
    }
  }, [nextCursor, isFetchingNextPage, fetchGlobalProducts]);

  return {
    restaurants,
    nearbyRestaurants,
    activeRestaurantId,
    setActiveRestaurantId,
    dbProducts,
    dbTrendingProducts,
    dbCategories,
    isLoading,
    error,
    refetch: loadHomeData,
    fetchNextPage,
    hasMore,
    isFetchingNextPage
  };
}
