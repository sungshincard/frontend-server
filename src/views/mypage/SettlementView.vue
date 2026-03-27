<script setup>
import { ref, onMounted, computed } from 'vue';
import settlementService from '@/services/settlementService';

const settlements = ref([]);
const loading = ref(true);

const pendingAmount = computed(() => {
  return settlements.value
    .filter(s => s.status === 'PENDING' || s.status === 'ON_HOLD')
    .reduce((sum, s) => sum + s.netAmount, 0);
});

const completedAmount = computed(() => {
  return settlements.value
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.netAmount, 0);
});

const fetchSettlements = async () => {
  try {
    loading.value = true;
    const res = await settlementService.getMySettlements();
    // ApiResponse.data에 실제 리스트가 들어있으므로 res.data를 할당
    settlements.value = res.data || [];
  } catch (err) {
    console.error('Failed to fetch settlements:', err);
    settlements.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getStatusLabel = (status) => {
  const labels = {
    PENDING: '정산 대기',
    ON_HOLD: '정산 보류',
    COMPLETED: '정산 완료',
    CANCELLED: '정산 취소'
  };
  return labels[status] || status;
};

onMounted(fetchSettlements);
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
        <div class="card-title">
          <span>정산 예정</span>
          <span class="info-icon" title="구매자가 구매 확정 시 정산이 진행됩니다.">ⓘ</span>
        </div>
        <strong>{{ pendingAmount.toLocaleString() }}원</strong>
        <p>구매 확정 후 영업일 기준 3~5일 내 입금됩니다.</p>
      </div>
      <div class="card">
        <div class="card-title">
          <span>정산 완료</span>
        </div>
        <strong>{{ completedAmount.toLocaleString() }}원</strong>
        <p>현재까지 완료된 누적 정산 금액입니다.</p>
      </div>
    </div>

    <div class="section-title">
      <h2>정산 내역</h2>
      <button class="refresh-btn" @click="fetchSettlements" :disabled="loading">
        {{ loading ? '로딩 중...' : '새로고침' }}
      </button>
    </div>

    <div v-if="settlements.length > 0" class="settlement-list">
      <div v-for="item in settlements" :key="item.id" class="settlement-item">
        <div class="item-main">
          <div class="item-info">
            <span class="date">{{ formatDate(item.createdAt) }}</span>
            <h3 class="card-name">{{ item.cardName }}</h3>
            <span class="order-id">주문번호: {{ item.tossOrderId }}</span>
          </div>
          <div class="item-amount">
            <div class="amount-row">
              <span>판매 금액</span>
              <span>{{ item.grossAmount.toLocaleString() }}원</span>
            </div>
            <div class="amount-row fee">
              <span>수수료 (3%)</span>
              <span>-{{ item.feeAmount.toLocaleString() }}원</span>
            </div>
            <div class="amount-row total">
              <span>정산 금액</span>
              <strong>{{ item.netAmount.toLocaleString() }}원</strong>
            </div>
          </div>
          <div class="item-status">
            <span :class="['status-badge', item.status.toLowerCase()]">
              {{ getStatusLabel(item.status) }}
            </span>
            <span v-if="item.settledAt" class="settled-date">
              입금일: {{ formatDate(item.settledAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="empty-history">
      <div class="icon">💰</div>
      <p>현재 정산 내역이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: 32px; }
.eyebrow { color: var(--color-primary); font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.page-head h1 { font-size: 32px; color: var(--color-text-strong); margin: 0 0 8px; }
.page-head p { color: var(--color-text-muted); }

.summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 48px; }
.card { padding: 32px; background: var(--color-panel); border: 1px solid var(--color-border); border-radius: 24px; display: flex; flex-direction: column; gap: 12px; }
.card.highlight { background: var(--color-background-elevated); border-color: var(--color-primary); }
.card-title { display: flex; justify-content: space-between; align-items: center; }
.info-icon { cursor: help; color: var(--color-text-muted); font-size: 16px; }
.card span { font-size: 14px; font-weight: 600; color: var(--color-text-muted); }
.card strong { font-size: 28px; color: var(--color-text-strong); }
.card p { font-size: 13px; color: var(--color-text-muted); margin: 0; }

.section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.section-title h2 { font-size: 20px; font-weight: 700; color: var(--color-text-strong); margin: 0; }
.refresh-btn { padding: 8px 16px; font-size: 14px; color: var(--color-text-muted); background: var(--color-panel); border: 1px solid var(--color-border); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.refresh-btn:hover { background: var(--color-border); color: var(--color-text-strong); }

.settlement-list { display: flex; flex-direction: column; gap: 16px; }
.settlement-item { padding: 24px; background: var(--color-panel); border: 1px solid var(--color-border); border-radius: 20px; transition: border-color 0.2s; }
.settlement-item:hover { border-color: var(--color-primary-soft); }

.item-main { display: grid; grid-template-columns: 1fr 200px 120px; gap: 24px; align-items: flex-start; }

.item-info { display: flex; flex-direction: column; gap: 4px; }
.date { font-size: 13px; color: var(--color-text-muted); }
.card-name { font-size: 17px; font-weight: 600; color: var(--color-text-strong); margin: 4px 0; }
.order-id { font-size: 13px; color: var(--color-text-muted); }

.item-amount { display: flex; flex-direction: column; gap: 6px; padding: 0 24px; border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); }
.amount-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--color-text-muted); }
.amount-row.fee { color: var(--color-error-soft); }
.amount-row.total { color: var(--color-text-strong); margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--color-border); }
.amount-row.total strong { font-size: 16px; }

.item-status { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.status-badge { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-align: center; }
.status-badge.pending { background: #fff3e0; color: #f57c00; }
.status-badge.on_hold { background: #efebe9; color: #795548; }
.status-badge.completed { background: #e8f5e9; color: #2e7d32; }
.status-badge.cancelled { background: #fce4ec; color: #c2185b; }
.settled-date { font-size: 12px; color: var(--color-text-muted); }

.empty-history { text-align: center; padding: 80px 0; border: 1px dashed var(--color-border); border-radius: 24px; color: var(--color-text-muted); }
.icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }

@media (max-width: 850px) {
  .item-main { grid-template-columns: 1fr; gap: 16px; }
  .item-amount { padding: 16px 0; border: none; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
  .item-status { align-items: flex-start; }
}

@media (max-width: 640px) {
  .summary-cards { grid-template-columns: 1fr; }
}
</style>
