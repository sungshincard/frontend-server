<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockOrders } from '../data/catalog'

const router = useRouter()
const activeTab = ref('BUY')

const orders = computed(() => mockOrders)
const statusLabelMap = {
  PAYMENT_PENDING: '결제대기',
  PAID: '결제완료',
  WAITING_FOR_SELLER: '발송대기',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  PURCHASE_CONFIRMED: '구매확정',
  COMPLETED: '거래완료',
  CANCELED: '취소됨',
  DISPUTED: '분쟁중',
  REFUNDED: '환불완료',
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

    <section class="orders-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-main">
          <span class="status-badge">{{ statusLabelMap[order.status] || order.status }}</span>
          <strong>{{ order.title }}</strong>
          <p>{{ tradeTypeLabelMap[order.tradeType] || order.tradeType }} · {{ order.orderedAt }}</p>
          <small>{{ activeTab === 'BUY' ? '판매자' : '구매자' }}: {{ order.seller }}</small>
        </div>
        <div class="order-side">
          <strong>{{ order.price }}</strong>
          <button type="button" class="detail-button" @click="goOrder(order.id)">거래 보기</button>
        </div>
      </article>
    </section>
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

.detail-button {
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  background: var(--color-background-elevated);
  color: var(--color-text-strong);
}

@media (max-width: 720px) {
  .order-card {
    flex-direction: column;
  }
}
</style>
