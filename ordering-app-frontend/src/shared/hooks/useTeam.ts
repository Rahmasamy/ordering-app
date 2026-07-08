import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../api/team.service';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => teamService.getRoles(),
  });
}

export function useMembers(
  restaurantId: number | string | undefined,
  filters?: { roleId?: number | string; branchId?: number | string; search?: string }
) {
  return useQuery({
    queryKey: ['members', restaurantId, filters],
    queryFn: () => teamService.getMembers(restaurantId!, filters),
    enabled: !!restaurantId,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { displayName: string; description?: string; permissionIds: number[] }) =>
      teamService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useToggleRolePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId, enabled }: { roleId: number | string; permissionId: number; enabled: boolean }) =>
      teamService.toggleRolePermission(roleId, { permissionId, enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useInviteMember(restaurantId: number | string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; phoneNumber: string; name: string; role: string; branchIds: number[] }) =>
      teamService.inviteMember(restaurantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', restaurantId] });
    },
  });
}

export function useUpdateMember(restaurantId: number | string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: number | string; data: { role?: string; status?: string } }) =>
      teamService.updateMember(restaurantId!, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', restaurantId] });
    },
  });
}

export function useDeleteMember(restaurantId: number | string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number | string) =>
      teamService.deleteMember(restaurantId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', restaurantId] });
    },
  });
}

export function useUpdateMemberBranches(restaurantId: number | string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, branchIds }: { memberId: number | string; branchIds: number[] }) =>
      teamService.updateMemberBranches(restaurantId!, memberId, { branchIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', restaurantId] });
    },
  });
}
