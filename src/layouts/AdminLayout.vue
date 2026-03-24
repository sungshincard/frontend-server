<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/themeStore';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = [
  { name: '대시보드', path: '/admin', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { name: '카드 도감 관리', path: '/admin/card-masters', icon: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z M4 19.5A2.5 2.5 0 0 1 6.5 17H20' },
  { name: '카드 추가 요청', path: '/admin/card-requests', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
  { name: '회원 관리', path: '/admin/members', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  { name: '주문/배송 관리', path: '/admin/orders', icon: 'M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' },
  { name: '환경 설정', path: '/admin/settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' },
];

const isActive = (path) => {
  if (path === '/admin') {
    return router.currentRoute.value.path === '/admin';
  }
  return router.currentRoute.value.path.startsWith(path);
};
</script>

<template>
  <div class="admin-layout" :data-theme="themeStore.theme">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'theme-dark': themeStore.theme === 'dark' }">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <span class="brand-text">ADMIN PANEL</span>
      </div>
      
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path" 
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.icon"></path>
          </svg>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout-sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>
          </svg>
          <span>로그아웃</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <h2 class="page-title">{{ router.currentRoute.value.name || 'Dashboard' }}</h2>
        </div>
        <div class="header-right">
          <div class="theme-toggle-wrapper">
            <button type="button" class="btn-theme-minimal" @click="themeStore.toggleTheme">
              <svg v-if="themeStore.theme === 'light'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="user-profile-compact">
            <div class="user-avatar-placeholder">{{ authStore.user?.nickname?.charAt(0) || 'A' }}</div>
            <div class="user-details">
              <span class="user-name">{{ authStore.user?.nickname }}</span>
              <span class="user-role">Super Admin</span>
            </div>
          </div>
          <button @click="handleLogout" class="btn-exit" title="로그아웃">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>
            </svg>
          </button>
        </div>
      </header>

      <div class="admin-content-scroller">
        <section class="admin-content">
          <router-view />
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text-strong);
  overflow: hidden;
}

/* Sidebar Styling - Premium Dark Refinement */
.admin-sidebar {
  width: 280px;
  background-color: var(--color-panel);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-brand {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);
}

.brand-logo {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.brand-text {
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 1px;
  color: var(--color-text-strong);
}

.sidebar-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--color-text-subtle);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: var(--color-panel-soft);
  color: var(--color-text-strong);
}

.nav-item.active {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.nav-icon-svg {
  width: 20px;
  height: 20px;
}

.sidebar-footer {
  padding: 20px 16px;
  border-top: 1px solid var(--color-border);
}

.btn-logout-sidebar {
  width: 100%;
  padding: 12px;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-muted);
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-logout-sidebar:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* Main Content Styling */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  position: relative;
}

.admin-header {
  height: 64px;
  background-color: rgba(var(--color-panel), 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 90;
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-strong);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border);
}

.btn-theme-minimal {
  padding: 8px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--color-text-subtle);
  cursor: pointer;
  display: flex;
  transition: all 0.2s;
}

.btn-theme-minimal:hover {
  background-color: var(--color-panel-soft);
  color: var(--color-primary);
}

.user-profile-compact {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.user-role {
  font-size: 11px;
  color: var(--color-text-subtle);
  font-weight: 500;
}

.btn-exit {
  padding: 8px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--color-text-subtle);
  cursor: pointer;
  display: flex;
}

.btn-exit:hover {
  color: #ef4444;
}

.admin-content-scroller {
  flex: 1;
  overflow-y: auto;
}

.admin-content {
  padding: 32px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 1200px) {
  .admin-sidebar { width: 80px; }
  .brand-text, .nav-text, .sidebar-footer, .user-details { display: none; }
  .nav-item { justify-content: center; padding: 12px; }
}
</style>
