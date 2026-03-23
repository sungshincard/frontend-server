import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Dex from '../views/Dex.vue';
import Auth from '../views/Auth.vue';
import MyPage from '../views/MyPage.vue';
import AccountVerify from '../views/AccountVerify.vue';
import AccountEdit from '../views/AccountEdit.vue';
import Cards from '../views/Cards.vue';
import CardGroup from '../views/CardGroup.vue';
import CardDetail from '../views/CardDetail.vue';
import SaleCardNew from '../views/SaleCardNew.vue';
import SaleCardDetail from '../views/SaleCardDetail.vue';
import Checkout from '../views/Checkout.vue';
import Watchlist from '../views/Watchlist.vue';
import StoreView from '../views/StoreView.vue';
import Orders from '../views/Orders.vue';
import OrderDetail from '../views/OrderDetail.vue';
import AddressBook from '../views/AddressBook.vue';
import CardRequest from '../views/CardRequest.vue';
import ReviewForm from '../views/ReviewForm.vue';
import DisputeForm from '../views/DisputeForm.vue';
import Policy from '../views/Policy.vue';
import { useAuthStore } from '../stores/auth';
import { toast } from 'vue3-toastify';

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
    path: '/mypage/account/verify',
    name: 'AccountVerify',
    component: AccountVerify
  },
  {
    path: '/mypage/account/edit',
    name: 'AccountEdit',
    component: AccountEdit
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    component: Watchlist
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  },
  {
    path: '/orders/:orderId',
    name: 'OrderDetail',
    component: OrderDetail
  },
  {
    path: '/orders/:orderId/review',
    name: 'ReviewForm',
    component: ReviewForm
  },
  {
    path: '/orders/:orderId/dispute',
    name: 'DisputeForm',
    component: DisputeForm
  },
  {
    path: '/addresses',
    name: 'AddressBook',
    component: AddressBook
  },
  {
    path: '/card-requests/new',
    name: 'CardRequest',
    component: CardRequest
  },
  {
    path: '/policy',
    name: 'Policy',
    component: Policy
  },
  {
    path: '/stores/:storeId',
    name: 'StoreView',
    component: StoreView
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
  },
  {
    path: '/sale-cards/new',
    name: 'SaleCardNew',
    component: SaleCardNew
  },
  {
    path: '/sale-cards/:saleCardId/edit',
    name: 'SaleCardEdit',
    component: SaleCardNew
  },
  {
    path: '/sale-cards/:saleCardId',
    name: 'SaleCardDetail',
    component: SaleCardDetail
  },
  {
    path: '/orders/checkout',
    name: 'Checkout',
    component: Checkout
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
  const authRequired = !isPublicPage;

  if (authRequired && !authStore.isAuthenticated) {
    toast.error('로그인이 필요한 서비스입니다.');
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
