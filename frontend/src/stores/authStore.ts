import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/shared';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        console.log('Auth store login called with:', email);
        set({ isLoading: true });
        try {
          console.log('Making API call to:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`);
          const response = await authApi.login({ email, password });
          console.log('Login API response:', response);
          const { user, token } = response.data as any;

          set({
            user,
            token,
            isLoading: false
          });
          console.log('Auth state updated successfully');
        } catch (error) {
          console.error('Auth store login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(userData);
          const { user, token } = response.data as any;

          set({
            user,
            token,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isLoading: false
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      }),
    }
  )
);