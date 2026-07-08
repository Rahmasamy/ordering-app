import api from './api-client';

export interface Action {
  id: number;
  action: string;
  enabled: boolean;
}

export interface Permission {
  resource: string;
  actions: Action[];
}

export interface RoleResponse {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
}

export interface MemberResponse {
  id: number;
  restaurantId: number;
  userId: number;
  roleId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  branchIds: number[];
}

export const teamService = {
  getRoles: async (): Promise<RoleResponse[]> => {
    const response = await api.get('/roles');
    return response.data.data.roles;
  },

  createRole: async (data: {
    displayName: string;
    description?: string;
    permissionIds: number[];
  }): Promise<RoleResponse> => {
    const response = await api.post('/roles', data);
    return response.data.data.role;
  },

  toggleRolePermission: async (
    roleId: number | string,
    data: { permissionId: number; enabled: boolean }
  ): Promise<any> => {
    const response = await api.post(`/roles/${roleId}/permissions/toggle`, data);
    return response.data.data;
  },

  getMembers: async (
    restaurantId: number | string,
    filters?: { roleId?: number | string; branchId?: number | string; search?: string }
  ): Promise<MemberResponse[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/members`, { params: filters });
    return Array.isArray(response.data.data) ? response.data.data : response.data.data.data || [];
  },

  inviteMember: async (
    restaurantId: number | string,
    data: {
      email: string;
      phoneNumber: string;
      name: string;
      role: string;
      branchIds: number[];
    }
  ): Promise<any> => {
    const response = await api.post(`/restaurants/${restaurantId}/members`, data);
    return response.data.data;
  },

  updateMember: async (
    restaurantId: number | string,
    memberId: number | string,
    data: { role?: string; status?: string }
  ): Promise<any> => {
    const response = await api.patch(`/restaurants/${restaurantId}/members/${memberId}`, data);
    return response.data.data;
  },

  deleteMember: async (restaurantId: number | string, memberId: number | string): Promise<any> => {
    const response = await api.delete(`/restaurants/${restaurantId}/members/${memberId}`);
    return response.data.data;
  },

  updateMemberBranches: async (
    restaurantId: number | string,
    memberId: number | string,
    data: { branchIds: number[] }
  ): Promise<any> => {
    const response = await api.put(`/restaurants/${restaurantId}/members/${memberId}/branches`, data);
    return response.data.data;
  }
};
