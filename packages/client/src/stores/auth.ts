import { computed, ref } from 'vue'
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
  const needsEmailVerified = ref(false);

  // 3. Simple wrappers for your auth methods
  const login = async (payload : LoginPayload) => {
    return await authClient.signIn.email({
      email: payload.email,
      password: payload.password
    }, {
      onError: (ctx) => {
        if (ctx.error.status === 403) {
          alert("Please verify your email address");
          needsEmailVerified.value = true;
        }
      },
      onSuccess: () => {
        needsEmailVerified.value = false;
      }
    });
  };

  const sendVerificationEmail = async (email : string) => {
    return await authClient.sendVerificationEmail({
      email: email,
      callbackURL: "/"
    });
  }

  const verify = async (token : string) => {
    return await authClient.verifyEmail({
      query: {
        token: token
      }
    }, {
      onError: (ctx) => {
        alert(ctx.error.message);
      },
      onSuccess: () => {
        needsEmailVerified.value = false;
      }
    });
  }

  const register = async (payload : RegisterPayload) => {
    needsEmailVerified.value = false;
    return await authClient.signUp.email({
      name: payload.name,
      email: payload.email,
      password: payload.password
    });
  };

  const logout = async () => {
    needsEmailVerified.value = false;
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
    needsEmailVerified,
    verify,
    isLoading,
    login,
    sendVerificationEmail,
    register,
    logout,
    checkSession
  };
});
