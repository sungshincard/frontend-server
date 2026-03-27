<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import productService from '@/services/productService'
import { getImageUrl } from '@/services/api'

const router = useRouter()
const isLoading = ref(true)
const listings = ref([])

const statusLabelMap = {
  ACTIVE: '판매중',
  PENDING: '예약중',
  SOLD: '판매완료',
  HIDDEN: '숨김',
}

const selectedStatus = ref('ALL')
const statusTabs = [
  { label: '전체', value: 'ALL' },
  { label: '판매중', value: 'ACTIVE' },
  { label: '판매완료', value: 'SOLD' },
]

const filteredListings = computed(() => {
  if (selectedStatus.value === 'ALL') return listings.value
  return listings.value.filter(item => item.status === selectedStatus.value)
})

const goDetail = (id) => router.push(`/sale-cards/${id}`)
const goEdit = (id) => router.push(`/sale-cards/${id}/edit`)
const goOrder = (orderId) => router.push(`/orders/${orderId}`)

const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await productService.getMySaleCards()
    listings.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch sales history', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="sales-history-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Inventory & Sales</p>
        <h1>판매 내역</h1>
        <p>출품 중인 상품을 관리합니다.</p>
      </div>
    </div>

    <div class="tabs-container">
      <button 
        v-for="tab in statusTabs" 
        :key="tab.value"
        class="tab-button"
        :class="{ active: selectedStatus === tab.value }"
        @click="selectedStatus = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="isLoading" class="loading">데이터를 불러오는 중...</div>
    
    <div v-else class="list-container">
      <div v-if="filteredListings.length > 0" class="orders-list">
        <article v-for="item in filteredListings" :key="item.id" class="order-card">
          <div class="order-visual">
            <img v-if="item.imageUrls && item.imageUrls.length > 0" :src="getImageUrl(item.imageUrls[0])" :alt="item.title">
            <div v-else class="no-img">No Image</div>
          </div>
          <div class="order-main">
            <span class="status-badge" :class="item.status.toLowerCase()">
              {{ statusLabelMap[item.status] || item.status }}
            </span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.conditionGrade }} 등급</p>
            <small>등록일: {{ new Date(item.createdAt).toLocaleDateString() }}</small>
          </div>
          <div class="order-side">
            <strong>{{ item.price.toLocaleString() }}원</strong>
            <div class="actions">
              <button v-if="item.status === 'ACTIVE'" type="button" class="detail-button" @click="goEdit(item.id)">수정</button>
              <button type="button" class="detail-button" @click="goDetail(item.id)">상세 보기</button>
              <button v-if="item.orderId" type="button" class="detail-button primary" @click="goOrder(item.orderId)">거래 보기</button>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">출품 중인 상품이 없습니다.</div>
    </div>
  </div>
</template>

<style scoped>
.sales-history-page { padding: 0 0 60px; }
.eyebrow { margin: 0 0 8px; color: var(--color-primary); font-size: 0.84rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.page-head h1 { color: var(--color-text-strong); margin-bottom: 8px; }
.page-head p { color: var(--color-text-muted); margin-bottom: 24px; }

.tabs-container { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; }
.tab-button {
  padding: 8px 20px; border: none; background: transparent; color: var(--color-text-muted); font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; position: relative;
}
.tab-button:hover { color: var(--color-text-strong); }
.tab-button.active { color: var(--color-primary); }
.tab-button.active::after {
  content: ''; position: absolute; bottom: -13px; left: 0; right: 0; height: 3px; background: var(--color-primary);
}

.orders-list { display: grid; gap: 14px; }
.order-card {
  display: grid; grid-template-columns: 100px 1fr auto; gap: 22px; padding: 22px;
  border: 1px solid var(--color-border); border-radius: 24px; background: var(--color-panel); box-shadow: var(--shadow-soft); align-items: center;
}

.order-visual {
  width: 100px; height: 100px; border-radius: 14px; overflow: hidden; border: 1px solid var(--color-border); background: var(--color-panel-soft);
}
.order-visual img { width: 100%; height: 100%; object-fit: cover; }
.no-img { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 0.8rem; color: var(--color-text-muted); }

.order-main { display: grid; gap: 6px; }
.order-main strong { font-size: 1.15rem; color: var(--color-text-strong); }
.order-main p, .order-main small { color: var(--color-text-muted); }

.status-badge {
  display: inline-flex; width: fit-content; padding: 4px 12px; border-radius: 999px; background: var(--color-background-elevated); color: var(--color-text-strong); font-size: 0.75rem; font-weight: 800;
}
.status-badge.active, .status-badge.payment_completed { background: #dcfce7; color: #166534; }
.status-badge.pending, .status-badge.shipping { background: #fef3c7; color: #92400e; }
.status-badge.sold, .status-badge.purchase_confirmed { background: #e0f2fe; color: #0c4a6e; }

.order-side { text-align: right; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
.order-side strong { font-size: 1.25rem; color: var(--color-text-strong); }

.actions { display: flex; gap: 8px; margin-top: 12px; }
.detail-button {
  padding: 8px 16px; border: 1px solid var(--color-border); background: var(--color-background-elevated); color: var(--color-text-strong); border-radius: 999px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.detail-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}
.detail-button.primary { background: var(--color-primary); border-color: transparent; color: var(--color-primary-text); }

.loading, .empty-state { text-align: center; padding: 60px 0; color: var(--color-text-muted); }

@media (max-width: 720px) {
  .order-card { grid-template-columns: 80px 1fr; gap: 12px; }
  .order-side { grid-column: 1 / -1; flex-direction: row; align-items: center; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 4px; }
}
</style>
