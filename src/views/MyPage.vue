<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const menuGroups = [
  {
    title: '내 정보',
    items: [
      { name: '프로필 정보', path: '/mypage/profile', icon: '👤' },
      { name: '주소록 관리', path: '/mypage/addresses', icon: '📍' },
    ]
  },
  {
    title: '쇼핑 정보',
    items: [
      { name: '구매 내역', path: '/mypage/orders', icon: '🛍️' },
      { name: '판매 내역', path: '/mypage/sales', icon: '🏷️' },
      { name: '관심 상품', path: '/mypage/watchlist', icon: '❤️' },
    ]
  },
  {
    title: '판매 정보',
    items: [
      { name: '정산 관리', path: '/mypage/settlement', icon: '💰' },
    ]
  }
];

const currentPath = computed(() => route.path);

const isActive = (path) => currentPath.value === path;
</script>

<template>
  <div class="mypage-layout container">
    <!-- Sidebar / LNB -->
    <aside class="mypage-sidebar">
      <div class="sidebar-header">
        <h2>마이페이지</h2>
      </div>
      
      <nav class="sidebar-nav">
        <div v-for="group in menuGroups" :key="group.title" class="nav-group">
          <h3>{{ group.title }}</h3>
          <ul>
            <li v-for="item in group.items" :key="item.path">
              <router-link :to="item.path" :class="{ active: isActive(item.path) }">
                <span class="icon">{{ item.icon }}</span>
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

    </aside>

    <!-- Main Content Area -->
    <main class="mypage-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.mypage-layout {
  display: flex;
  gap: 40px;
  padding: 60px 0 100px;
  min-height: 80vh;
}

/* Sidebar Styling */
.mypage-sidebar {
  flex: 0 0 240px;
  display: flex;
  flex-direction: column;
}

.sidebar-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 32px;
  color: var(--color-text-strong);
}

.nav-group {
  margin-bottom: 32px;
}

.nav-group h3 {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 12px;
  padding-left: 12px;
}

.nav-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-group li {
  margin-bottom: 4px;
}

.nav-group a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  text-decoration: none;
  color: var(--color-text-light);
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.2s;
}

.nav-group a:hover {
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
}

.nav-group a.active {
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-weight: 700;
}

.icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.logout-btn:hover {
  background: #fff5f5;
  color: #e53e3e;
  border-color: #feb2b2;
}

/* Content Styling */
.mypage-content {
  flex: 1;
  background: white;
  min-height: 600px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .mypage-layout {
    flex-direction: column;
    gap: 24px;
    padding: 24px 20px;
  }

  .mypage-sidebar {
    flex: none;
    width: 100%;
  }

  .sidebar-header {
    display: none; /* Hide main title on mobile if needed */
  }

  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding-bottom: 12px;
    gap: 24px;
    -webkit-overflow-scrolling: touch;
  }

  .nav-group {
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .nav-group h3 {
    font-size: 11px;
    margin-bottom: 8px;
    padding-left: 0;
  }

  .nav-group ul {
    display: flex;
    gap: 8px;
  }

  .nav-group a {
    padding: 8px 14px;
    font-size: 14px;
    white-space: nowrap;
    background: var(--color-background-elevated);
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
