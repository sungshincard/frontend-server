<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productService from '@/services/productService'
import orderService from '@/services/orderService'
import { getImageUrl } from '@/services/api'

const router = useRouter()
const isLoading = ref(true)
const listings = ref([])
const soldOrders = ref([])
const activeTab = ref('listed') // 'listed' or 'sold'

const statusLabelMap = {
  ACTIVE: '판매중',
  RESERVED: '예약중',
  SOLD: '판매완료',
  HIDDEN: '숨김',
}

const orderStatusMap = {
  PAID: '발송대기',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  PURCHASE_CONFIRMED: '구매확정',
  CANCELLED: '취소됨'
}

const goDetail = (id) => router.push(`/sale-cards/${id}`)
const goOrderDetail = (id) => router.push(`/orders/${id}`)

const fetchData = async () => {
  try {
    isLoading.value = true
    const [listingsRes, ordersRes] = await Promise.all([
      productService.getMySaleCards(),
      orderService.getSalesHistory()
    ])
    listings.value = listingsRes.data || []
    soldOrders.value = ordersRes.data || []
  } catch (error) {
    console.error('Failed to fetch sales history', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="sales-history-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Inventory & Sales</p>
        <h1>판매 내역</h1>
        <p>출품 중인 상품과 판매 완료된 주문을 관리합니다.</p>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="tab-menu">
      <button :class="{ active: activeTab === 'listed' }" @click="activeTab = 'listed'">
        판매 중 ({{ listings.length }})
      </button>
      <button :class="{ active: activeTab === 'sold' }" @click="activeTab = 'sold'">
        판매된 주문 ({{ soldOrders.length }})
      </button>
    </div>

    <div v-if="isLoading" class="loading">데이터를 불러오는 중...</div>
    
    <div v-else>
      <!-- 판매 중 탭 -->
      <section v-if="activeTab === 'listed'" class="list-container">
        <div v-if="listings.length > 0" class="orders-list">
          <article v-for="item in listings" :key="item.id" class="order-card">
            <div class="order-visual">
              <img v-if="item.imageUrls && item.imageUrls.length > 0" :src="getImageUrl(item.imageUrls[0])" :alt="item.title">
              <div v-else class="no-img">No Image</div>
            </div>
            <div class="order-main">
              <span class="status-badge" :class="item.status.toLowerCase()">
                {{ statusLabelMap[item.status] || item.status }}
              </span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.cardMaster?.cardName }} · {{ item.conditionGrade }} 등급</p>
              <small>등록일: {{ new Date(item.createdAt).toLocaleDateString() }}</small>
            </div>
            <div class="order-side">
              <strong>{{ item.price.toLocaleString() }}원</strong>
              <div class="actions">
                <button type="button" class="detail-button primary" @click="goDetail(item.id)">상세 보기</button>
                <button v-if="item.status === 'ACTIVE'" type="button" class="detail-button" @click="goDetail(item.id)">수정</button>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">출품 중인 상품이 없습니다.</div>
      </section>

      <!-- 판매된 주문 탭 -->
      <section v-if="activeTab === 'sold'" class="list-container">
        <div v-if="soldOrders.length > 0" class="orders-list">
          <article v-for="order in soldOrders" :key="order.id" class="order-card sold">
            <div class="order-main">
              <span class="status-badge" :class="order.status.toLowerCase()">
                {{ orderStatusMap[order.status] || order.status }}
              </span>
              <strong>{{ order.saleCardTitle }}</strong>
              <p>구매자: @{{ order.buyerNickname }} · {{ order.tradeType }}</p>
              <small>결제총액: {{ (order.totalPrice || 0).toLocaleString() }}원</small>
            </div>
            <div class="order-side">
              <strong class="order-id">#{{ order.id }}</strong>
              <div class="actions">
                <button type="button" class="detail-button primary" @click="goOrderDetail(order.id)">주문 관리</button>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">판매 완료된 주문이 없습니다.</div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sales-history-page { padding: 0 0 60px; }
.eyebrow { margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.page-head h1 { color: var(--color-text-strong); margin-bottom: 8px; }
.page-head p { color: var(--color-text-muted); margin-bottom: 24px; }

/* 탭 메뉴 스타일 */
.tab-menu {
  display: flex; gap: 0; border-bottom: 1px solid var(--color-border); margin-bottom: 24px;
}
.tab-menu button {
  flex: 1; padding: 16px; border: 0; background: none; color: var(--color-text-muted); font-weight: 700; cursor: pointer; transition: all 0.2s;
  border-bottom: 2px solid transparent;
}
.tab-menu button.active {
  color: var(--color-primary); border-bottom-color: var(--color-primary);
}

.orders-list { display: grid; gap: 14px; }
.order-card {
  display: grid; grid-template-columns: 100px 1fr auto; gap: 22px; padding: 22px;
  border: 1px solid var(--color-border); border-radius: 24px; background: var(--color-panel); box-shadow: var(--shadow-soft); align-items: center;
}
.order-card.sold { grid-template-columns: 1fr auto; }

.order-visual {
  width: 100px; height: 100px; border-radius: 14px; overflow: hidden; border: 1px solid var(--color-border); background: var(--color-panel-soft);
}
.order-visual img { width: 100%; height: 100%; object-fit: cover; }
.no-img { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 0.8rem; color: var(--color-text-muted); }

.order-main { display: grid; gap: 6px; }
.order-main strong { font-size: 1.15rem; color: var(--color-text-strong); }
.order-main p, .order-main small { color: var(--color-text-muted); }

.status-badge {
  display: inline-flex; width: fit-content; padding: 4px 12px; border-radius: 999px; background: var(--color-background-elevated); color: var(--color-text-strong); font-size: 0.75rem; font-weight: 800;
}
.status-badge.active, .status-badge.paid { background: #dcfce7; color: #166534; }
.status-badge.reserved, .status-badge.shipped { background: #fef3c7; color: #92400e; }
.status-badge.sold, .status-badge.purchase_confirmed { background: #e0f2fe; color: #0c4a6e; }

.order-side { text-align: right; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
.order-side strong { font-size: 1.25rem; color: var(--color-text-strong); }
.order-id { font-family: monospace; font-size: 1rem !important; color: var(--color-text-muted) !important; }

.actions { display: flex; gap: 8px; margin-top: 12px; }
.detail-button {
  padding: 8px 16px; border: 1px solid var(--color-border); background: var(--color-background-elevated); color: var(--color-text-strong); border-radius: 999px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.detail-button.primary { background: var(--color-primary); border-color: transparent; color: #2c2407; }

.loading, .empty-state { text-align: center; padding: 60px 0; color: var(--color-text-muted); }

@media (max-width: 720px) {
  .order-card { grid-template-columns: 80px 1fr; gap: 12px; }
  .order-side { grid-column: 1 / -1; flex-direction: row; align-items: center; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 4px; }
}
</style>
