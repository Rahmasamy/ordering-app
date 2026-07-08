import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '../api/restaurant.service';

export function useBranches(restaurantId: number | string | undefined) {
  return useQuery({
    queryKey: ['branches', restaurantId],
    queryFn: () => restaurantService.getBranches(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useCreateBranch(restaurantId: number | string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      countryCode: string;
      label: string;
      addressText: string;
      lat: number;
      lng: number;
      opensAt: string;
      closesAt: string;
      deliveryRadius: number;
      currency: string;
    }) => restaurantService.createBranch(restaurantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', restaurantId] });
    },
  });
}

export function useUpdateBranch(restaurantId: number | string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, data }: {
      branchId: number | string;
      data: {
        label?: string;
        addressText?: string;
        lat?: number;
        lng?: number;
        opensAt?: string;
        closesAt?: string;
        deliveryRadius?: number;
        currency?: string;
        acceptOrders?: boolean;
      };
    }) => restaurantService.updateBranch(branchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', restaurantId] });
    },
  });
}
