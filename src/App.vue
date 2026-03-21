<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const theme = ref('dark')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const themeLabel = computed(() => (theme.value === 'dark' ? '라이트 모드' : '다크 모드'))

const applyTheme = (nextTheme) => {
  theme.value = nextTheme
  document.documentElement.setAttribute('data-theme', nextTheme)
  localStorage.setItem('theme', nextTheme)
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  applyTheme(savedTheme)
})
</script>

<template>
  <div class="app-layout">
    <header class="site-header">
      <div class="container header-inner">
        <router-link to="/" class="brand-mark">
          <span class="brand-badge">CD</span>
          <span class="brand-copy">
            <strong>CardDex</strong>
            <small>Pokemon Card Market</small>
          </span>
        </router-link>

        <nav class="site-nav">
          <router-link to="/">메인</router-link>
          <router-link to="/dex">도감 탐색</router-link>
          <router-link to="/cards">카드 탐색</router-link>
          <router-link v-if="authStore.isAuthenticated" to="/mypage">마이페이지</router-link>
          <button type="button" class="nav-button theme-button" @click="toggleTheme">
            {{ themeLabel }}
          </button>
          <template v-if="authStore.isAuthenticated">
            <button type="button" class="nav-button" @click="handleLogout">로그아웃</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-cta">로그인</router-link>
          </template>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div>
          <strong>CardDex</strong>
          <p>도감 기반 탐색과 출품 비교, 에스크로 정산을 결합한 포켓몬 카드 거래 서비스.</p>
        </div>
        <div class="footer-links">
          <span>카드 검색</span>
          <span>도감 탐색</span>
          <span>출품 비교</span>
          <span>운영 정책</span>
        </div>
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

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-background) 94%, transparent);
  backdrop-filter: blur(18px);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 74px;
  gap: 20px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: #20300c;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-copy strong {
  color: var(--color-text-strong);
  font-size: 1.05rem;
  letter-spacing: -0.03em;
}

.brand-copy small {
  color: var(--color-text-subtle);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.site-nav a,
.nav-button {
  padding: 10px 16px;
  border-radius: 999px;
  color: var(--color-text-muted);
  font-size: 0.96rem;
  font-weight: 600;
  background: transparent;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.site-nav a:hover,
.nav-button:hover,
.theme-button {
  color: var(--color-text-strong);
  background: var(--color-panel-soft);
}

.nav-cta {
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
  color: var(--color-text-strong) !important;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.main-content {
  flex: 1;
}

.site-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background: var(--color-panel);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 0 40px;
}

.footer-inner strong {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--color-text-strong);
}

.footer-inner p,
.footer-links span {
  color: var(--color-text-subtle);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-end;
  gap: 10px 18px;
}

@media (max-width: 900px) {
  .header-inner,
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .site-nav,
  .footer-links {
    justify-content: flex-start;
  }
}
</style>
