<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const code = route.query.code
const message = route.query.message
const orderId = route.query.orderId

const goCheckout = () => router.push('/checkout')
const goHome = () => router.push('/')
</script>

<template>
  <div class="payment-result-page container">
    <div class="result-card error-state">
      <div class="icon-circle error">❌</div>
      <h1>결제에 실패했습니다</h1>
      <p>{{ message || '알 수 없는 이유로 결제가 중단되었습니다.' }}</p>
      
      <div class="error-details" v-if="code">
        <span>에러 코드: {{ code }}</span>
        <span v-if="orderId">주문 번호: {{ orderId }}</span>
      </div>

      <div class="actions">
        <button class="primary-button" @click="goCheckout">다시 결제하기</button>
        <button class="secondary-button" @click="goHome">홈으로 이동</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* OrderSuccess.vue와 동일한 스타일 (생략 가능하나 유지보수 위해 각각 가짐) */
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
  margin-bottom: 24px;
}

.error-details {
  background: var(--color-background-elevated);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: var(--color-text-subtle);
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
}

.primary-button {
  background: var(--color-primary);
  color: #2c2407;
  border: none;
}

.secondary-button {
  background: transparent;
  color: var(--color-text-strong);
  border: 1px solid var(--color-border);
}
</style>
