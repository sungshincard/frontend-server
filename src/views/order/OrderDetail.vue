<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const order = ref(null)
const loading = ref(true)
const error = ref(null)

const statusLabelMap = {
  PENDING: '결제대기',
  PAYMENT_COMPLETED: '결제완료/발송대기',
  PREPARING: '배송준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  PURCHASE_CONFIRMED: '구매확정',
  CANCELLED: '취소됨',
  DISPUTED: '분쟁중'
}
const steps = ['PAYMENT_COMPLETED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'PURCHASE_CONFIRMED']

const tradeTypeLabelMap = {
  SHIPPING: '택배거래',
  DIRECT: '대면거래',
}

const currentStepIndex = computed(() => {
  const map = {
    PAYMENT_COMPLETED: 0,
    PREPARING: 1,
    SHIPPING: 2,
    DELIVERED: 3,
    PURCHASE_CONFIRMED: 4
  }
  return map[order.value?.status] ?? -1
})

const isBuyer = computed(() => {
  if (!authStore.user) return false
  return authStore.user.id == order.value?.buyerId || (!!authStore.user.nickname && authStore.user.nickname == order.value?.buyerNickname)
})
const isSeller = computed(() => {
  if (!authStore.user) return false
  return authStore.user.id == order.value?.sellerId || (!!authStore.user.nickname && authStore.user.nickname == order.value?.sellerNickname)
})

const fetchOrder = async () => {
  try {
    loading.value = true
    const response = await orderService.getOrder(route.params.orderId)
    order.value = response.data
  } catch (err) {
    console.error('Failed to fetch order:', err)
    error.value = '주문 정보를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const handleCancel = async () => {
  const reason = prompt('취소 사유를 입력해 주세요 (예: 단순 변심, 상품 문제 등)')
  if (!reason) return

  try {
    if (confirm('주문을 취소하시겠습니까? 결제 금액은 전액 환불됩니다.')) {
      await orderService.cancelOrder(order.value.id, reason)
      alert('주문이 취소되었습니다.')
      fetchOrder()
    }
  } catch (err) {
    alert('주문 취소 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message))
  }
}

const handlePrepareShipment = async () => {
  try {
    if (confirm('배송 준비 상태로 변경하시겠습니까? 배송 정보 엔티티가 생성됩니다.')) {
      await orderService.prepareShipment(order.value.id)
      alert('배송 준비 중으로 변경되었습니다.')
      fetchOrder()
    }
  } catch (err) {
    alert('배송 준비 처리 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message))
  }
}

const handleDeliver = async () => {
  try {
    if (confirm('주문을 배송 완료 상태로 변경하시겠습니까?')) {
      await orderService.deliverShipment(order.value.id)
      alert('배송 완료 처리되었습니다.')
      fetchOrder()
    }
  } catch (err) {
    alert('배송 완료 처리 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message))
  }
}

const handleShipment = async () => {
  const carrier = prompt('택배사를 입력해 주세요 (예: CJ대한통운, 우체국 등)')
  if (!carrier) return
  const trackingNumber = prompt('송장 번호를 입력해 주세요')
  if (!trackingNumber) return

  try {
    await orderService.updateShipping(order.value.id, { carrier, trackingNumber })
    alert('배송 중 상태로 변경되었습니다.')
    fetchOrder()
  } catch (err) {
    alert('배송 정보 등록 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message))
  }
}

const handleConfirm = async () => {
  try {
    const canConfirm = 
      (order.value.tradeType === 'SHIPPING' && (order.value.status === 'SHIPPING' || order.value.status === 'DELIVERED')) ||
      (order.value.tradeType === 'DIRECT' && order.value.status === 'PAYMENT_COMPLETED');
    
    if (!canConfirm) {
      alert('현재 상태에서는 구매 확정이 불가능합니다.');
      return;
    }

    if (confirm('상품을 수령하셨나요? 구매 확정 후에는 취소 및 환불이 어렵습니다.')) {
      await orderService.confirmOrder(order.value.id)
      alert('구매 확정 처리가 완료되었습니다.')
      fetchOrder()
    }
  } catch (err) {
    alert('구매 확정 중 오류가 발생했습니다.')
  }
}


const goListing = () => {
  if (order.value?.saleCardId) router.push(`/saleCards/${order.value.saleCardId}`)
}
const goReview = () => router.push(`/orders/${route.params.orderId}/review`)
const goDispute = () => router.push(`/orders/${route.params.orderId}/dispute`)

onMounted(fetchOrder)
</script>

<template>
  <div v-if="loading" class="order-detail-page container">
    <div class="loading-state">주문 정보를 불러오는 중...</div>
  </div>
  <div v-else-if="error" class="order-detail-page container">
    <div class="error-state">{{ error }}</div>
    <button type="button" @click="router.back()">뒤로 가기</button>
  </div>
  <div v-else-if="order" class="order-detail-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Order Detail</p>
        <h1>거래 상세</h1>
        <p>{{ order.saleCardTitle }} 주문의 상태와 이력을 확인합니다.</p>
      </div>
      <button type="button" class="back-button" @click="router.back()">이전으로</button>
    </div>

    <section class="detail-layout">
      <article class="detail-card hero-card">
        <div class="hero-copy">
          <span class="status-badge" :class="order.status.toLowerCase()">{{ statusLabelMap[order.status] || order.status }}</span>
          <strong>{{ order.saleCardTitle }}</strong>
          <p>{{ tradeTypeLabelMap[order.tradeType] || order.tradeType }} · 주문번호 {{ order.id }}</p>
          <small>판매자: @{{ order.sellerNickname }} · 구매자: @{{ order.buyerNickname }}</small>
        </div>
        <button type="button" class="listing-button" @click="goListing">상품 정보</button>
      </article>

      <article v-if="order.status !== 'CANCELLED'" class="detail-card">
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
          <span>결제 총액</span>
          <strong>{{ (order.totalPrice || 0).toLocaleString() }}원</strong>
        </div>
        <div>
          <span>거래 방식</span>
          <strong>{{ tradeTypeLabelMap[order.tradeType] || order.tradeType }}</strong>
        </div>
        <div>
          <span>진행 상태</span>
          <strong>{{ statusLabelMap[order.status] || order.status }}</strong>
        </div>
        <div>
          <span>송장 정보</span>
          <strong v-if="order.trackingNumber">{{ order.carrier }} {{ order.trackingNumber }}</strong>
          <strong v-else-if="order.status === 'PAYMENT_COMPLETED'">발송 대기 중</strong>
          <strong v-else-if="order.status === 'SHIPPING'">배송 중</strong>
          <strong v-else>-</strong>
        </div>
        <div v-if="order.paidAt">
          <span>결제 일시</span>
          <strong>{{ new Date(order.paidAt).toLocaleString() }}</strong>
        </div>
        <div v-if="order.shippedAt">
          <span>발송 일시</span>
          <strong>{{ new Date(order.shippedAt).toLocaleString() }}</strong>
        </div>
      </article>

      <!-- 액션 패널 -->
      <article class="detail-card action-panel">
        <div class="section-head">
          <h2>거래 관리</h2>
        </div>
        <div class="action-grid">
          <!-- 공통 액션 -->
          <button v-if="order.status === 'PAYMENT_COMPLETED'" type="button" class="cancel-btn" @click="handleCancel">주문 취소</button>
          
          <!-- 판매자 액션 -->
          <button v-if="isSeller && order.status === 'PAYMENT_COMPLETED'" type="button" class="primary-btn" @click="handlePrepareShipment">배송 준비 중</button>
          <button v-if="isSeller && order.status === 'PREPARING'" type="button" class="primary-btn" @click="handleShipment">배송 중으로 변경</button>
          <button v-if="isSeller && order.status === 'SHIPPING'" type="button" class="primary-btn" @click="handleDeliver">배송 완료 처리</button>
          
          <!-- 구매자 액션 -->
          <button v-if="isBuyer && (
            (order.tradeType === 'SHIPPING' && (order.status === 'SHIPPING' || order.status === 'DELIVERED')) ||
            (order.tradeType === 'DIRECT' && order.status === 'PAYMENT_COMPLETED')
          )" type="button" class="primary-btn" @click="handleConfirm">구매 확정</button>
          
          <button type="button" @click="goDispute">문의/분쟁</button>
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
  width: fit-content; padding: 6px 14px; border-radius: 999px; background: var(--color-background-elevated); color: var(--color-text-muted); font-size: 0.9rem; font-weight: 800;
}
.status-badge.payment_completed, .status-badge.shipping, .status-badge.delivered {
  background: var(--color-primary); color: var(--color-primary-text);
}
.status-badge.purchase_confirmed {
  background: #27ae60; color: #fff;
}
.status-badge.cancelled {
  background: #e74c3c; color: #fff;
}
.section-head { margin-bottom: 20px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; }
.timeline { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.timeline-step {
  display: grid; gap: 10px; justify-items: center; color: var(--color-text-muted); font-size: 0.85rem;
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
  padding: 20px; border: 1px solid var(--color-border); margin: -1px 0 0 -1px; display: grid; gap: 8px;
}
.action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.action-grid button { padding: 18px 14px; border-radius: 18px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
.action-grid button:hover { transform: translateY(-2px); box-shadow: var(--shadow-soft); }
.primary-btn { background: var(--color-primary) !important; color: var(--color-primary-text) !important; border: 0 !important; }
.cancel-btn { color: #e74c3c !important; }
.test-btn { background: #f39c12 !important; color: #fff !important; border: 2px dashed #e67e22 !important; font-style: italic; }

.loading-state, .error-state { padding: 80px; text-align: center; color: var(--color-text-muted); }

@media (max-width: 800px) {
  .page-head, .hero-card, .timeline, .info-grid, .action-grid { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }
  .timeline { gap: 24px; padding-left: 20px; justify-items: start; }
  .timeline-step { grid-template-columns: auto 1fr; gap: 16px; align-items: center; justify-items: start; }
}
</style>
