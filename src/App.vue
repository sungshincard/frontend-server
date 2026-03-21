<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { notifications } from './data/catalog'

const authStore = useAuthStore()
const router = useRouter()
const theme = ref('dark')
const showNotifications = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const themeLabel = computed(() => (theme.value === 'dark' ? '라이트 모드' : '다크 모드'))
const unreadCount = computed(() => notifications.filter((item) => !item.read).length)
const userMetaLabel = computed(() => {
  if (!authStore.isAuthenticated) return ''
  if (authStore.userRole === 'ADMIN') return '관리자'
  return '내 상점 운영'
})

const applyTheme = (nextTheme) => {
  theme.value = nextTheme
  document.documentElement.setAttribute('data-theme', nextTheme)
  localStorage.setItem('theme', nextTheme)
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const goNotification = (href) => {
  showNotifications.value = false
  router.push(href)
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
          <router-link v-if="authStore.isAuthenticated" to="/watchlist">관심 카드</router-link>
          <router-link v-if="authStore.isAuthenticated" to="/orders">내 거래</router-link>
          <router-link v-if="authStore.isAuthenticated" to="/mypage">마이페이지</router-link>
          <div v-if="authStore.isAuthenticated" class="notification-wrap">
            <button type="button" class="nav-button notification-button" @click="toggleNotifications">
              알림
              <span v-if="unreadCount" class="notification-count">{{ unreadCount }}</span>
            </button>
            <div v-if="showNotifications" class="notification-popover">
              <div class="notification-head">
                <strong>알림</strong>
              </div>
              <button
                v-for="item in notifications"
                :key="item.id"
                type="button"
                class="notification-item"
                :class="{ unread: !item.read }"
                @click="goNotification(item.href)"
              >
                <strong>{{ item.title }}</strong>
                <span>{{ item.message }}</span>
                <small>{{ item.time }}</small>
              </button>
            </div>
          </div>
          <div v-if="authStore.isAuthenticated" class="user-chip">
            <strong>{{ authStore.displayName }}</strong>
            <span>{{ userMetaLabel }}</span>
          </div>
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
          <router-link to="/cards">카드 검색</router-link>
          <router-link to="/dex">도감 탐색</router-link>
          <router-link to="/card-requests/new">카드 추가 요청</router-link>
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

.notification-wrap {
  position: relative;
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

.user-chip {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 18px;
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
  line-height: 1.1;
}

.notification-button {
  position: relative;
}

.notification-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 8px;
  padding: 0 5px;
  border-radius: 999px;
  background: #d93a2f;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
}

.notification-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 320px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  z-index: 30;
}

.notification-head {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.notification-head strong,
.notification-item strong {
  color: var(--color-text-strong);
}

.notification-item {
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-top: 1px solid var(--color-border);
  background: transparent;
  display: grid;
  gap: 4px;
  text-align: left;
}

.notification-item.unread {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.notification-item span,
.notification-item small {
  color: var(--color-text-subtle);
}

.user-chip strong {
  font-size: 0.86rem;
  font-weight: 700;
}

.user-chip span {
  font-size: 0.72rem;
  color: var(--color-text-subtle);
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
.footer-links span,
.footer-links a {
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
