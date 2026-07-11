import { computed } from 'vue'
import { defineStore } from 'pinia'
import { authClient } from '@/auth-client'

interface LoginPayload {
  email: string,
  password: string
}

interface RegisterPayload {
  name: string,
  email: string,
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // 1. Better Auth automatically manages this reactive session state
  const session = authClient.useSession();

  // 2. Computed properties keep your store clean and intuitive
  const user = computed(() => session.value.data?.user ?? null);
  const isLoading = computed(() => session.value.isPending);
  const isAuthenticated = computed(() => !!session.value.data?.session);

  // 3. Simple wrappers for your auth methods
  const login = async (payload : LoginPayload) => {
    return await authClient.signIn.email({
      email: payload.email,
      password: payload.password
    });
  };

  const register = async (payload : RegisterPayload) => {
    return await authClient.signUp.email({
      name: payload.name,
      email: payload.email,
      password: payload.password
    });
  };

  const logout = async () => {
    return await authClient.signOut();
  };

  // 4. Force a manual freshness check (optional)
  // Better Auth updates `useSession` automatically, but this is great for route guards
  const checkSession = async () => {
    const { data } = await authClient.getSession();
    return !!data;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkSession
  };
});
