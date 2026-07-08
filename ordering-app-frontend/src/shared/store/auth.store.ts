import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponse } from '../api/auth.service';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  setAuth: (user: UserResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
