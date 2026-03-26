<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const result = ref(null)
const error = ref(null)

onMounted(async () => {
  const { paymentKey, orderId, amount } = route.query

  if (!paymentKey || !orderId || !amount) {
    error.value = '결제 정보가 부족합니다.'
    loading.value = false
    return
  }

  try {
    // 백엔드 결제 승인 API 호출
    const response = await axios.get('http://localhost:8080/api/v1/payments/toss/success', {
      params: { paymentKey, orderId, amount },
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (response.data.status === 200) {
      result.value = response.data.data
    } else {
      error.value = response.data.message || '결제 승인 중 오류가 발생했습니다.'
    }
  } catch (err) {
    console.error('Payment Confirmation Error:', err)
    error.value = err.response?.data?.message || '서버 통신 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
})

const goHome = () => router.push('/')
const goOrders = () => router.push('/mypage/orders')
</script>

<template>
  <div class="payment-result-page container">
    <div v-if="loading" class="result-card loading-state">
      <div class="spinner"></div>
      <h1>결제 승인 중...</h1>
      <p>잠시만 기다려 주세요. 결제를 최종 확인하고 있습니다.</p>
    </div>

    <div v-else-if="result" class="result-card success-state">
      <div class="icon-circle">✅</div>
      <h1>결제가 완료되었습니다!</h1>
      <p>주문이 성공적으로 접수되었습니다. 판매자가 배송을 시작하면 알림을 보내드립니다.</p>
      
      <div class="info-grid">
        <div class="info-row"><span>주문 번호</span><strong>{{ result.orderId }}</strong></div>
        <div class="info-row"><span>결제 금액</span><strong>{{ result.totalAmount?.toLocaleString() }}원</strong></div>
        <div class="info-row"><span>결제 방법</span><strong>{{ result.method }}</strong></div>
      </div>

      <div class="actions">
        <button class="primary-button" @click="goOrders">주문 내역 보기</button>
        <button class="secondary-button" @click="goHome">홈으로 이동</button>
      </div>
    </div>

    <div v-else class="result-card error-state">
      <div class="icon-circle error">❌</div>
      <h1>결제에 실패했습니다</h1>
      <p>{{ error || '알 수 없는 오류가 발생했습니다.' }}</p>
      
      <div class="actions">
        <button class="primary-button" @click="router.push('/checkout')">다시 시도하기</button>
        <button class="secondary-button" @click="goHome">홈으로 이동</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-result-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.result-card {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 32px;
  padding: 48px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: var(--color-background-elevated);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 24px;
}

.icon-circle.error {
  color: #ff4d4f;
}

h1 {
  margin: 0 0 12px;
  font-size: 2rem;
  color: var(--color-text-strong);
}

p {
  color: var(--color-text-muted);
  margin-bottom: 32px;
}

.info-grid {
  background: var(--color-background-elevated);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.info-row span {
  color: var(--color-text-subtle);
}

.info-row strong {
  color: var(--color-text-strong);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-button, .secondary-button {
  padding: 16px;
  border-radius: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s;
}

.primary-button {
  background: var(--color-primary);
  color: var(--color-primary-text);
  border: none;
}

.secondary-button {
  background: transparent;
  color: var(--color-text-strong);
  border: 1px solid var(--color-border);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
