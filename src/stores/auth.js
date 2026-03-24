import { defineStore } from 'pinia';

const USER_STORAGE_KEY = 'auth-user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null')
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    displayName: (state) => state.user?.nickname || '게스트',
    hasStore: (state) => !!state.user?.store,
    storeInfo: (state) => state.user?.store || null
  },
  actions: {
    setSession({ token, user }) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    },
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    setUser(user) {
      this.user = user;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }
});
