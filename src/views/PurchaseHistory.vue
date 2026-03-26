<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import orderService from '../services/orderService'

const router = useRouter()
const isLoading = ref(true)
const orders = ref([])
 
const statusLabelMap = {
  PENDING: '입금대기',
  PAID: '결제완료',
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

onMounted(async () => {
  try {
    const response = await orderService.getPurchaseHistory()
    orders.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch purchase history', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="orders-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Purchases</p>
        <h1>구매 내역</h1>
        <p>내가 구매한 상품의 진행 상태를 확인합니다.</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading">불러오는 중...</div>
    <section v-else-if="orders && orders.length > 0" class="orders-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-main">
          <span class="status-badge" :class="order.status.toLowerCase()">
            {{ statusLabelMap[order.status] || order.status }}
          </span>
          <strong>{{ order.title }}</strong>
          <p>{{ tradeTypeLabelMap[order.tradeType] || order.tradeType }} · {{ order.orderedAt }}</p>
          <small>판매자: {{ order.seller }}</small>
        </div>
        <div class="order-side">
          <strong>{{ order.price }}</strong>
          <button type="button" class="detail-button" @click="goOrder(order.id)">거래 보기</button>
        </div>
      </article>
    </section>
    <div v-else class="empty-state">
      <p>구매한 내역이 없습니다.</p>
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

.page-head h1 {
  color: var(--color-text-strong);
  margin-bottom: 8px;
}

.page-head p {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.orders-list {
  display: grid;
  gap: 14px;
}

.order-card {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}

.order-main,
.order-side {
  display: grid;
  gap: 8px;
}

.order-main strong {
  font-size: 1.1rem;
  color: var(--color-text-strong);
}

.order-main p, .order-main small {
  color: var(--color-text-muted);
}

.status-badge {
  display: inline-flex;
  width: fit-content;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  font-size: 0.8rem;
  font-weight: 700;
}

.status-badge.paid { background: #e0f2fe; color: #0c4a6e; }
.status-badge.shipped { background: #fef3c7; color: #92400e; }
.status-badge.delivered { background: #dcfce7; color: #166534; }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }

.order-side {
  text-align: right;
  align-content: space-between;
}

.order-side strong {
  font-size: 1.2rem;
  color: var(--color-text-strong);
}

.detail-button {
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-button:hover {
  background: var(--color-primary);
  border-color: transparent;
  color: white;
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .order-card {
    flex-direction: column;
  }
  .order-side {
    text-align: left;
    margin-top: 10px;
  }
}
</style>
