import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Auth from '../views/Auth.vue';
import MyPage from '../views/MyPage.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Basic navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const publicPages = ['/login', '/', '/register'];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
