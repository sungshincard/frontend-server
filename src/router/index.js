import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Dex from '../views/Dex.vue';
import Auth from '../views/Auth.vue';
import MyPage from '../views/MyPage.vue';
import Cards from '../views/Cards.vue';
import CardGroup from '../views/CardGroup.vue';
import CardDetail from '../views/CardDetail.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dex',
    name: 'Dex',
    component: Dex
  },
  {
    path: '/login',
    name: 'Login',
    component: Auth
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage
  },
  {
    path: '/cards',
    name: 'Cards',
    component: Cards
  },
  {
    path: '/cards/group/:groupId',
    name: 'CardGroup',
    component: CardGroup
  },
  {
    path: '/cards/:cardId',
    name: 'CardDetail',
    component: CardDetail
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Basic navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isPublicPage =
    ['/login', '/', '/register', '/cards', '/dex'].includes(to.path) ||
    to.path.startsWith('/cards/group/') ||
    (/^\/cards\/[^/]+$/.test(to.path) && !to.path.startsWith('/cards/group/'));
  const authRequired = !isPublicPage;

  if (authRequired && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
