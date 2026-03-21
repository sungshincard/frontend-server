<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderById } from '../data/catalog'

const route = useRoute()
const router = useRouter()

const order = computed(() => getOrderById(route.params.orderId))
const disputeType = ref('NOT_AS_DESCRIBED')
const title = ref('')
const description = ref('')

const disputeOptions = [
  { value: 'NOT_AS_DESCRIBED', label: '상태 불일치' },
  { value: 'DAMAGED', label: '배송 중 파손' },
  { value: 'FAKE_SUSPECTED', label: '가품 의심' },
  { value: 'DELIVERY_ISSUE', label: '배송 문제' },
  { value: 'ETC', label: '기타' },
]
</script>

<template>
  <div v-if="order" class="dispute-page container">
    <div class="page-head">
      <div>
        <p class="eyebrow">Dispute</p>
        <h1>분쟁 접수</h1>
        <p>{{ order.title }} 거래에 대한 문제를 접수합니다.</p>
      </div>
      <button type="button" class="back-button" @click="router.push(`/orders/${order.id}`)">거래 상세로</button>
    </div>

    <section class="dispute-card">
      <div class="summary-box">
        <strong>{{ order.title }}</strong>
        <span>{{ order.seller }} · {{ order.price }} · {{ order.status }}</span>
      </div>

      <label class="field">
        <span>분쟁 유형</span>
        <select v-model="disputeType">
          <option v-for="option in disputeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>

      <label class="field">
        <span>제목</span>
        <input v-model="title" type="text" placeholder="예: 수령한 카드 상태가 설명과 다릅니다.">
      </label>

      <label class="field">
        <span>상세 내용</span>
        <textarea v-model="description" rows="8" placeholder="문제 상황, 수령 상태, 요청하는 처리 방향을 적어 주세요." />
      </label>

      <label class="field">
        <span>증빙 이미지</span>
        <button type="button" class="upload-box">
          <strong>이미지 업로드</strong>
          <small>파손 부위, 포장 상태, 실물 사진 첨부</small>
        </button>
      </label>

      <div class="submit-row">
        <button type="button" class="submit-button">분쟁 접수</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dispute-page { padding: 40px 0 80px; }
.page-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 24px; }
.eyebrow { margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.page-head h1, .summary-box strong, .field span { color: var(--color-text-strong); margin: 0; }
.page-head p, .summary-box span, .upload-box small { color: var(--color-text-muted); }
.back-button { padding: 12px 16px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--color-background-elevated); color: var(--color-text-strong); }
.dispute-card {
  border: 1px solid var(--color-border); border-radius: 28px; background: var(--color-panel); box-shadow: var(--shadow-soft); padding: 28px; display: grid; gap: 18px;
}
.summary-box { display: grid; gap: 6px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); }
.field { display: grid; gap: 8px; }
.field input, .field textarea, .field select {
  width: 100%; border: 1px solid var(--color-border); border-radius: 16px; background: var(--color-background-elevated); padding: 14px 16px; color: var(--color-text-strong);
}
.upload-box {
  min-height: 120px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-background-elevated); display: grid; place-items: center; text-align: center;
}
.upload-box strong { color: var(--color-text-strong); }
.submit-row { display: flex; justify-content: flex-end; margin-top: 6px; }
.submit-button {
  padding: 14px 20px; border: 0; border-radius: 16px; background: #d93a2f; color: white; font-weight: 800;
}
</style>
