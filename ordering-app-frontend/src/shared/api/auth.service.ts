import api from './api-client';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  phone: string;
  name: string;
  password?: string;
  role: string;
  restaurant?: {
    name: string;
    primaryCountry: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  systemRole: string;
  role?: string;
  restaurantId?: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}

export const authService = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    // The backend uses sendSuccess utility which wraps response inside { success: true, data: { ... } }
    const backendData = response.data.data;
    
    let restaurantId: string | undefined;
    if (backendData.accessToken) {
      const parts = backendData.accessToken.split('.');
      if (parts.length > 1) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.restaurantId) {
            restaurantId = String(payload.restaurantId);
          }
        } catch (e) {
          console.error('Error decoding access token payload:', e);
        }
      }
    }

    return {
      accessToken: backendData.accessToken,
      user: {
        id: backendData.user.id,
        email: backendData.user.email,
        name: backendData.user.name || backendData.user.email.split('@')[0],
        systemRole: backendData.user.systemRole,
        role: backendData.user.systemRole,
        phone: backendData.user.phone,
        restaurantId
      }
    };
  },
  
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    const backendData = response.data.data;

    let restaurantId: string | undefined;
    if (backendData.accessToken) {
      const parts = backendData.accessToken.split('.');
      if (parts.length > 1) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.restaurantId) {
            restaurantId = String(payload.restaurantId);
          }
        } catch (e) {
          console.error('Error decoding access token payload:', e);
        }
      }
    }

    return {
      accessToken: backendData.accessToken,
      user: {
        id: backendData.user.id,
        email: backendData.user.email,
        name: backendData.user.name || backendData.user.email.split('@')[0],
        systemRole: backendData.user.systemRole,
        role: backendData.user.systemRole,
        phone: backendData.user.phone,
        restaurantId
      }
    };
  },
  
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API call failed or not configured, continuing local clear.');
    }
  }
};
