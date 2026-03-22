import { defineStore } from 'pinia';

const USER_STORAGE_KEY = 'auth-user';

const mockProfiles = {
  USER: {
    id: 101,
    email: 'user@mock.local',
    nickname: '상장성점',
    role: 'USER',
    status: 'ACTIVE',
    profileImageUrl: null,
    name: '홍상점',
    phoneNumber: '010-1111-2222',
    birthDate: '1998-04-12',
    gender: 'NONE',
    store: {
      id: 1,
      storeName: '상장성점',
      intro: '포켓몬 희귀 카드 위주로 출품합니다. 상태 기준과 실물 사진을 최대한 상세하게 공개합니다.',
      ratingAvg: 4.8,
      reviewCount: 10,
      completedSaleCount: 14
    },
    saleCards: [
      {
        id: 'sale-card-charizard-sar-2',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=320&q=80',
        title: '리자몽 ex SAR A급',
        price: 189000,
        status: 'ACTIVE',
        updatedAt: '2026-03-21 19:18'
      },
      {
        id: 'sale-card-mew-1',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=320&q=80',
        title: '뮤 ex UR',
        price: 78000,
        status: 'ACTIVE',
        updatedAt: '2026-03-21 13:40'
      },
      {
        id: 'sale-card-pikachu-promo-1',
        imageUrl: 'https://images.unsplash.com/photo-1603481546579-65d935ba9cdd?auto=format&fit=crop&w=320&q=80',
        title: '피카츄 프로모',
        price: 29000,
        status: 'ACTIVE',
        updatedAt: '2026-03-21 13:10'
      },
      {
        id: 'sale-card-charizard-vstar-2',
        imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=320&q=80',
        title: '리자몽 VSTAR 미감정',
        price: 149000,
        status: 'SOLD',
        updatedAt: '2026-03-20 17:34'
      }
    ]
  },
  ADMIN: {
    id: 1,
    email: 'admin@mock.local',
    nickname: '운영관리자',
    role: 'ADMIN',
    status: 'ACTIVE',
    profileImageUrl: null,
    name: '관리자',
    phoneNumber: '010-9999-0000',
    birthDate: '1990-01-01',
    gender: 'NONE',
    store: {
      id: 999,
      storeName: '운영 검수 계정',
      intro: '관리자 테스트용 상점 데이터입니다.',
      ratingAvg: 5.0,
      reviewCount: 0,
      completedSaleCount: 0
    },
    saleCards: []
  }
};

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
    storeInfo: (state) => state.user?.store || null,
    isMockSession: (state) => state.token?.startsWith('mock-token-') || false
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
    loginWithMock(profileKey) {
      const profile = mockProfiles[profileKey];
      if (!profile) {
        throw new Error(`Unsupported mock profile: ${profileKey}`);
      }

      this.setSession({
        token: `mock-token-${profileKey.toLowerCase()}`,
        user: profile
      });
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }
});
