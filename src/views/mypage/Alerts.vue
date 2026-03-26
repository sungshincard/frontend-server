<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import productService from '../../services/productService'

const router = useRouter()
const watchlist = ref([])
const isLoading = ref(true)

const fetchWatchlist = async () => {
  try {
    isLoading.value = true
    const response = await productService.getMyWatchlist()
    watchlist.value = response.data
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
  } finally {
    isLoading.value = false
  }
}

const alerts = computed(() => 
  watchlist.value.filter(item => item.watchType === 'CARD_MASTER')
)

onMounted(fetchWatchlist)

const goCard = (id) => router.push(`/cards/${id}`)

const toggleAlert = async (id) => {
  try {
    await productService.toggleWatchlist(id)
    fetchWatchlist() // Refresh
  } catch (error) {
    console.error('Failed to toggle alert:', error)
  }
}
</script>

<template>
  <div class="alerts-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Notifications</p>
        <h1>입고 알림 설정</h1>
        <p>새로운 매물이 등록되면 알림을 드립니다.</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>알림 설정을 불러오는 중...</p>
    </div>

    <div v-else-if="alerts.length === 0" class="empty-state">
      <div class="empty-icon">🔔</div>
      <h3>설정된 알림이 없습니다.</h3>
      <p>관심 있는 카드의 상세 페이지에서 알림을 설정해 보세요!</p>
      <button type="button" class="primary-button" @click="router.push('/cards')">카드 보러가기</button>
    </div>

    <div v-else class="alerts-list">
      <article 
        v-for="item in alerts" 
        :key="item.id" 
        class="alert-card"
        @click="goCard(item.cardMaster.id)"
      >
        <div class="card-visual">
          <img v-if="item.cardMaster.imageUrl" :src="item.cardMaster.imageUrl" :alt="item.cardMaster.cardName" />
          <div v-else class="placeholder-art"></div>
        </div>
        <div class="card-info">
          <span class="set-name">{{ item.cardMaster.cardSetName }}</span>
          <strong>{{ item.cardMaster.cardName }}</strong>
          <div class="card-meta">
            <span>{{ item.cardMaster.rarity }}</span>
            <span class="price" v-if="item.cardMaster.lowestPrice">{{ item.cardMaster.lowestPrice.toLocaleString() }}원~</span>
          </div>
        </div>
        <div class="card-action">
          <button type="button" class="action-btn active" @click.stop="toggleAlert(item.cardMaster.id)">
            알림 해제
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.alerts-page {
  padding: 0 0 60px;
}

.page-head {
  margin-bottom: 32px;
}

.eyebrow {
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.page-head h1 {
  font-size: 32px;
  color: var(--color-text-strong);
  margin: 0 0 8px;
}

.page-head p {
  color: var(--color-text-muted);
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-card {
  display: flex;
  align-items: center;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.alert-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-soft);
}

.card-visual {
  width: 60px;
  height: 84px;
  background: var(--color-panel-soft);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
}

.card-visual img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-name {
  font-size: 11px;
  color: var(--color-text-muted);
}

.card-info strong {
  font-size: 16px;
  color: var(--color-text-strong);
}

.card-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.price {
  color: var(--color-primary) !important;
  font-weight: 700;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.action-btn.active {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.action-btn.active:hover {
  background: #fff5f5;
  color: #e53e3e;
  border-color: #feb2b2;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  filter: grayscale(1);
  opacity: 0.3;
}

.primary-button {
  margin-top: 24px;
  padding: 12px 24px;
  background: var(--color-primary);
  color: var(--color-primary-text);
  border: 0;
  border-radius: 12px;
  font-weight: 700;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted);
}
</style>
