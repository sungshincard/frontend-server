<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import orderService from '@/services/orderService'
import { getImageUrl } from '@/services/api'

const router = useRouter()
const route = useRoute()
const activeTab = ref('BUY') // 'BUY' or 'SELL'
const isLoading = ref(true)
const orders = ref([])

const fetchOrders = async () => {
  try {
    isLoading.value = true
    const response = activeTab.value === 'BUY' 
      ? await orderService.getPurchaseHistory()
      : await orderService.getSalesHistory()
    orders.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (route.query.type === 'sell') {
    activeTab.value = 'SELL'
  } else {
    activeTab.value = 'BUY'
  }
  fetchOrders()
})

watch(activeTab, () => {
  fetchOrders()
})
const statusLabelMap = {
  PENDING: '입금대기',
  PAID: '발송대기',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  PURCHASE_CONFIRMED: '구매확정',
  CANCELLED: '취소됨',
  DISPUTED: '분쟁중',
}
const tradeTypeLabelMap = {
  DELIVERY: '택배거래',
  FACE_TO_FACE: '대면거래',
}

const goOrder = (orderId) => router.push(`/orders/${orderId}`)
</script>

<template>
  <div class="orders-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Orders</p>
        <h1>내 거래 목록</h1>
        <p>구매 내역과 판매 내역을 한 화면에서 상태별로 확인합니다.</p>
      </div>
    </div>

    <div class="tab-row">
      <button type="button" class="tab-chip" :class="{ active: activeTab === 'BUY' }" @click="activeTab = 'BUY'">구매 내역</button>
      <button type="button" class="tab-chip" :class="{ active: activeTab === 'SELL' }" @click="activeTab = 'SELL'">판매 내역</button>
    </div>

    <div v-if="isLoading" class="loading-state">데이터를 불러오는 중...</div>
    <section v-else-if="orders.length > 0" class="orders-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-visual">
          <img :src="getImageUrl(order.thumbnailUrl)" :alt="order.saleCardTitle">
        </div>
        <div class="order-main">
          <span class="status-badge" :class="order.status.toLowerCase()">
            {{ statusLabelMap[order.status] || order.status }}
          </span>
          <strong>{{ order.saleCardTitle }}</strong>
          <p>{{ tradeTypeLabelMap[order.tradeType] || order.tradeType }} · {{ new Date(order.orderedAt).toLocaleDateString() }}</p>
          <small>{{ activeTab === 'BUY' ? '판매자' : '구매자' }}: @{{ activeTab === 'BUY' ? order.sellerNickname : order.buyerNickname }}</small>
        </div>
        <div class="order-side">
          <strong>{{ (order.totalPrice || 0).toLocaleString() }}원</strong>
          <button type="button" class="detail-button" @click="goOrder(order.id)">거래 보기</button>
        </div>
      </article>
    </section>
    <div v-else class="empty-state">
      <p>{{ activeTab === 'BUY' ? '구매한' : '판매한' }} 내역이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  padding: 40px 0 80px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-head h1,
.order-main strong,
.order-side strong {
  color: var(--color-text-strong);
}

.page-head p,
.order-main p,
.order-main small {
  color: var(--color-text-muted);
}

.tab-row {
  display: flex;
  gap: 10px;
  margin: 24px 0 18px;
}

.tab-chip,
.detail-button {
  border-radius: 999px;
  font-weight: 700;
}

.tab-chip {
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
}

.tab-chip.active {
  background: var(--color-primary);
  border-color: transparent;
  color: #2c2407;
}

.orders-list {
  display: grid;
  gap: 14px;
}

.order-card {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 22px;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
  align-items: center;
}

.order-visual {
  width: 100px;
  height: 100px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
}

.order-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-main,
.order-side {
  display: grid;
  gap: 8px;
}

.status-badge {
  display: inline-flex;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-size: 0.84rem;
  font-weight: 700;
}

.status-badge.paid { background: #dcfce7; color: #166534; }
.status-badge.shipped { background: #fef3c7; color: #92400e; }
.status-badge.delivered, .status-badge.purchase_confirmed { background: #e0f2fe; color: #0c4a6e; }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }

.loading-state, .empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .order-card {
    flex-direction: column;
  }
}
</style>
