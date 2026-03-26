import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { toast } from 'vue3-toastify';

// MyPage Nested Components
// Lazy loaded below

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/Home.vue')
  },
  {
    path: '/dex',
    name: 'Dex',
    component: () => import('@/views/card/Dex.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Auth.vue')
  },
  {
    path: '/mypage',
    component: () => import('@/views/MyPage.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/mypage/profile' },
      { path: 'profile', name: 'MyProfile', component: () => import('@/views/mypage/ProfileView.vue') },
      { path: 'orders', name: 'PurchaseHistory', component: () => import('@/views/mypage/OrderHistory.vue') },
      { path: 'sales', name: 'SalesHistory', component: () => import('@/views/mypage/SalesHistory.vue') },
      { path: 'watchlist', name: 'MyWatchlist', component: () => import('@/views/mypage/Watchlist.vue') },
      { path: 'addresses', name: 'MyAddresses', component: () => import('@/views/mypage/AddressBook.vue') },
      { path: 'settlement', name: 'Settlement', component: () => import('@/views/mypage/SettlementView.vue') },
      {
        path: 'account/verify',
        name: 'AccountVerify',
        component: () => import('@/views/auth/AccountVerify.vue')
      },
      {
        path: 'account/edit',
        name: 'AccountEdit',
        component: () => import('@/views/auth/AccountEdit.vue')
      },
    ]
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/order/Orders.vue')
  },
  {
    path: '/orders/:orderId',
    name: 'OrderDetail',
    component: () => import('@/views/order/OrderDetail.vue')
  },
  {
    path: '/orders/:orderId/review',
    name: 'ReviewForm',
    component: () => import('@/views/support/ReviewForm.vue')
  },
  {
    path: '/orders/:orderId/dispute',
    name: 'DisputeForm',
    component: () => import('@/views/support/DisputeForm.vue')
  },
  {
    path: '/card-requests/new',
    name: 'CardRequest',
    component: () => import('@/views/card/CardRequest.vue')
  },
  {
    path: '/policy',
    name: 'Policy',
    component: () => import('@/views/support/Policy.vue')
  },
  {
    path: '/stores/:storeId',
    name: 'StoreView',
    component: () => import('@/views/market/StoreView.vue')
  },
  {
    path: '/cards',
    name: 'Cards',
    component: () => import('@/views/card/Cards.vue')
  },
  {
    path: '/cards/group/:groupId',
    name: 'CardGroup',
    component: () => import('@/views/card/CardGroup.vue')
  },
  {
    path: '/cards/:cardId',
    name: 'CardDetail',
    component: () => import('@/views/card/CardDetail.vue')
  },
  {
    path: '/sale-cards/new',
    name: 'SaleCardNew',
    component: () => import('@/views/market/SaleCardNew.vue')
  },
  {
    path: '/sale-cards/:saleCardId/edit',
    name: 'SaleCardEdit',
    component: () => import('@/views/market/SaleCardNew.vue')
  },
  {
    path: '/sale-cards/:saleCardId',
    name: 'SaleCardDetail',
    component: () => import('@/views/market/SaleCardDetail.vue')
  },
  {
    path: '/orders/checkout',
    name: 'Checkout',
    component: () => import('@/views/order/Checkout.vue')
  },
  {
    path: '/order/success',
    name: 'OrderSuccess',
    component: () => import('@/views/order/OrderSuccess.vue')
  },
  {
    path: '/order/fail',
    name: 'OrderFail',
    component: () => import('@/views/order/OrderFail.vue')
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        name: '어드민 대시보드',
        component: () => import('@/views/admin/AdminHome.vue')
      },
      {
        path: 'card-masters',
        name: '카드 도감 관리',
        component: () => import('@/views/admin/AdminCardMaster.vue')
      }
    ]
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
    to.path.startsWith('/sale-cards/') ||
    (/^\/cards\/[^/]+$/.test(to.path) && !to.path.startsWith('/cards/group/'));
  
  // Custom check for nested mypage if necessary
  const authRequired = !isPublicPage || to.matched.some(record => record.meta.requiresAuth);

  if (authRequired && !authStore.isAuthenticated) {
    toast.error('로그인이 필요한 서비스입니다.');
    next('/login');
  } else if (to.matched.some(record => record.meta.requiresAdmin) && authStore.userRole !== 'ADMIN') {
    toast.error('관리자 권한이 필요합니다.');
    next('/');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
