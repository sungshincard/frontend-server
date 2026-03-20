<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="app-layout">
    <header class="header">
      <div class="container header-content">
        <router-link to="/" class="brand-logo">CARD MALL</router-link>
        <nav class="nav-links">
          <router-link to="/">Home</router-link>
          <template v-if="authStore.isAuthenticated">
            <router-link to="/mypage">My Page</router-link>
            <button class="nav-btn" @click="handleLogout">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login">Login</router-link>
          </template>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view></router-view>
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 Card Trading Platform. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.brand-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a, .nav-btn {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  text-transform: uppercase;
}

.nav-links a:hover, .nav-btn:hover {
  color: var(--color-text-light);
}

.main-content {
  flex: 1;
}

.footer {
  background-color: #fafafa;
  border-top: 1px solid var(--color-border);
  padding: 40px 0;
  text-align: center;
  color: var(--color-text-light);
  font-size: 12px;
  margin-top: auto;
}
</style>
