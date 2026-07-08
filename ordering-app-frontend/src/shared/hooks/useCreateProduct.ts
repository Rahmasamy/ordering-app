import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/product.service';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, data }: { restaurantId: number; data: any }) => {
      return await productService.createProduct(restaurantId, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-categories'] });
    },
  });
}
