<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getListingById, getOrderById } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const order = computed(() => getOrderById(route.params.orderId))
const listing = computed(() => (order.value ? getListingById(order.value.listingId) : null))

const steps = ['PAID', 'WAITING_FOR_SELLER', 'SHIPPED', 'DELIVERED', 'PURCHASE_CONFIRMED']
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
const currentStepIndex = computed(() => {
  const map = {
    PAID: 0,
    WAITING_FOR_SELLER: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    PURCHASE_CONFIRMED: 4,
    COMPLETED: 4,
  }
  return map[order.value?.status] ?? 0
})

const goListing = () => {
  if (listing.value) router.push(`/listings/${listing.value.id}`)
}
const goReview = () => router.push(`/orders/${route.params.orderId}/review`)
const goDispute = () => router.push(`/orders/${route.params.orderId}/dispute`)
</script>

<template>
  <div v-if="order && listing" class="order-detail-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Order Detail</p>
        <h1>거래 상세</h1>
        <p>{{ order.title }} 주문의 상태와 이력을 확인합니다.</p>
      </div>
      <button type="button" class="back-button" @click="router.push('/orders')">거래 목록으로</button>
    </div>

    <section class="detail-layout">
      <article class="detail-card hero-card">
        <div class="hero-copy">
          <span class="status-badge">{{ statusLabelMap[order.status] || order.status }}</span>
          <strong>{{ order.title }}</strong>
          <p>{{ tradeTypeLabelMap[order.tradeType] || order.tradeType }} · 주문일 {{ order.orderedAt }}</p>
          <small>판매자 {{ order.seller }} · 총 결제금액 {{ order.paymentAmount.toLocaleString() }}원</small>
        </div>
        <button type="button" class="listing-button" @click="goListing">출품 보기</button>
      </article>

      <article class="detail-card">
        <div class="section-head">
          <h2>거래 진행 상태</h2>
        </div>
        <div class="timeline">
          <div
            v-for="(step, index) in steps"
            :key="step"
            class="timeline-step"
            :class="{ active: index <= currentStepIndex }"
          >
            <div class="timeline-dot"></div>
            <span>{{ statusLabelMap[step] || step }}</span>
          </div>
        </div>
      </article>

      <article class="detail-card info-grid">
        <div>
          <span>상품명</span>
          <strong>{{ order.title }}</strong>
        </div>
        <div>
          <span>거래 방식</span>
          <strong>{{ tradeTypeLabelMap[order.tradeType] || order.tradeType }}</strong>
        </div>
        <div>
          <span>판매자</span>
          <strong>{{ order.seller }}</strong>
        </div>
        <div>
          <span>운송장</span>
          <strong>{{ order.tradeType === 'DELIVERY' ? 'CJ 5566-7788-9900' : '대면거래' }}</strong>
        </div>
        <div>
          <span>배송비</span>
          <strong>{{ order.shippingFee.toLocaleString() }}원</strong>
        </div>
        <div>
          <span>수수료</span>
          <strong>{{ order.feeAmount.toLocaleString() }}원</strong>
        </div>
      </article>

      <article class="detail-card action-panel">
        <div class="section-head">
          <h2>구매자 액션</h2>
        </div>
        <div class="action-grid">
          <button type="button">구매 확정</button>
          <button type="button" @click="goDispute">분쟁 접수</button>
          <button type="button">판매자 문의</button>
        </div>
        <div v-if="order.reviewable" class="review-cta">
          <span>이 거래는 후기 작성이 가능합니다.</span>
          <button type="button" class="review-button" @click="goReview">후기 남기기</button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.order-detail-page { padding: 40px 0 80px; }
.page-head {
  display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 24px;
}
.eyebrow {
  margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
}
.page-head h1, .section-head h2, .hero-copy strong, .info-grid strong { color: var(--color-text-strong); margin: 0; }
.page-head p, .hero-copy p, .hero-copy small, .info-grid span { color: var(--color-text-muted); }
.back-button, .listing-button, .action-grid button {
  border: 1px solid var(--color-border); background: var(--color-background-elevated); color: var(--color-text-strong);
}
.back-button, .listing-button { padding: 12px 16px; border-radius: 999px; }
.detail-layout { display: grid; gap: 18px; }
.detail-card {
  border: 1px solid var(--color-border); border-radius: 24px; background: var(--color-panel); box-shadow: var(--shadow-soft); padding: 24px;
}
.hero-card {
  display: flex; justify-content: space-between; gap: 20px; align-items: center;
}
.hero-copy { display: grid; gap: 8px; }
.status-badge {
  width: fit-content; padding: 8px 12px; border-radius: 999px; background: var(--color-primary); color: #2c2407; font-weight: 800;
}
.section-head { margin-bottom: 16px; }
.timeline { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.timeline-step {
  display: grid; gap: 10px; justify-items: center; color: var(--color-text-muted);
}
.timeline-dot {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--color-border); background: var(--color-background-elevated);
}
.timeline-step.active { color: var(--color-text-strong); font-weight: 700; }
.timeline-step.active .timeline-dot { background: var(--color-primary); border-color: transparent; }
.info-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0;
}
.info-grid div {
  padding: 16px; border: 1px solid var(--color-border); margin: -1px 0 0 -1px; display: grid; gap: 6px;
}
.action-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.action-grid button { padding: 16px 14px; border-radius: 16px; font-weight: 700; }
.review-cta {
  margin-top: 16px;
  padding: 16px;
  border-radius: 18px;
  background: var(--color-background-elevated);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.review-cta span { color: var(--color-text-muted); }
.review-button {
  padding: 12px 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: #2c2407;
  font-weight: 800;
}
@media (max-width: 800px) {
  .page-head, .hero-card, .timeline, .info-grid, .action-grid { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }
  .review-cta { flex-direction: column; align-items: stretch; }
}
</style>
