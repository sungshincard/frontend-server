<script setup>
import { ref } from 'vue';

const pendingAmount = ref(0);
const completedAmount = ref(0);
</script>

<template>
  <div class="settlement-view">
    <div class="page-head">
      <p class="eyebrow">Finance</p>
      <h1>정산 관리</h1>
      <p>판매 완료된 상품의 정산 현황 및 입금 내역을 확인합니다.</p>
    </div>

    <div class="summary-cards">
      <div class="card highlight">
        <span>정산 예정</span>
        <strong>{{ pendingAmount.toLocaleString() }}원</strong>
        <p>구매자가 구매 확정 시 정산이 진행됩니다.</p>
      </div>
      <div class="card">
        <span>정산 완료</span>
        <strong>{{ completedAmount.toLocaleString() }}원</strong>
        <p>최근 30일 기준 입금 완료 금액입니다.</p>
      </div>
    </div>

    <div class="empty-history">
      <div class="icon">💰</div>
      <p>최근 정산 내역이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: 32px; }
.eyebrow { color: var(--color-primary); font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.page-head h1 { font-size: 32px; color: var(--color-text-strong); margin: 0 0 8px; }
.page-head p { color: var(--color-text-muted); }

.summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
.card { padding: 32px; background: var(--color-panel); border: 1px solid var(--color-border); border-radius: 24px; display: flex; flex-direction: column; gap: 12px; }
.card.highlight { background: var(--color-background-elevated); border-color: var(--color-primary); }
.card span { font-size: 14px; font-weight: 600; color: var(--color-text-muted); }
.card strong { font-size: 28px; color: var(--color-text-strong); }
.card p { font-size: 13px; color: var(--color-text-muted); margin: 0; }

.empty-history { text-align: center; padding: 80px 0; border: 1px dashed var(--color-border); border-radius: 24px; color: var(--color-text-muted); }
.icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }

@media (max-width: 640px) {
  .summary-cards { grid-template-columns: 1fr; }
}
</style>
