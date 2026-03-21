<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderById } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const order = computed(() => getOrderById(route.params.orderId))
const rating = ref(5)
const reviewText = ref('')

const goBack = () => router.push(`/orders/${route.params.orderId}`)
</script>

<template>
  <div v-if="order" class="review-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Review</p>
        <h1>거래 후기 작성</h1>
        <p>{{ order.title }} 거래에 대한 평점과 후기를 남겨 주세요.</p>
      </div>
      <button type="button" class="back-button" @click="goBack">거래 상세로</button>
    </div>

    <section class="review-card">
      <div class="order-summary">
        <strong>{{ order.title }}</strong>
        <span>{{ order.seller }} · {{ order.price }} · {{ order.status }}</span>
      </div>

      <div class="rating-row">
        <span>평점</span>
        <div class="star-row">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="star-button"
            :class="{ active: star <= rating }"
            @click="rating = star"
          >
            ★
          </button>
        </div>
      </div>

      <label class="field">
        <span>후기 내용</span>
        <textarea v-model="reviewText" rows="7" placeholder="판매자 응답, 포장 상태, 카드 상태 등을 적어 주세요." />
      </label>

      <div class="submit-row">
        <button type="button" class="submit-button">후기 등록</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.review-page { padding: 40px 0 80px; }
.page-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 24px; }
.eyebrow { margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.page-head h1, .order-summary strong, .field span { color: var(--color-text-strong); margin: 0; }
.page-head p, .order-summary span { color: var(--color-text-muted); }
.back-button { padding: 12px 16px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--color-background-elevated); color: var(--color-text-strong); }
.review-card {
  border: 1px solid var(--color-border); border-radius: 28px; background: var(--color-panel); box-shadow: var(--shadow-soft); padding: 28px; display: grid; gap: 22px;
}
.order-summary { display: grid; gap: 6px; padding-bottom: 18px; border-bottom: 1px solid var(--color-border); }
.rating-row { display: grid; gap: 10px; }
.rating-row span { color: var(--color-text-strong); font-weight: 700; }
.star-row { display: flex; gap: 6px; }
.star-button {
  border: 0; background: transparent; font-size: 2rem; color: #d1d5db;
}
.star-button.active { color: var(--color-primary); }
.field { display: grid; gap: 8px; }
.field textarea {
  width: 100%; border: 1px solid var(--color-border); border-radius: 18px; background: var(--color-background-elevated); padding: 14px 16px; color: var(--color-text-strong);
}
.submit-row { display: flex; justify-content: flex-end; }
.submit-button {
  padding: 14px 20px; border: 0; border-radius: 16px; background: var(--color-primary); color: #2c2407; font-weight: 800;
}
</style>
