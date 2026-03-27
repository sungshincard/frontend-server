<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import productService from '../../services/productService'
import { getImageUrl } from '@/services/api'

const router = useRouter()
const watchlist = ref([])
const isLoading = ref(true)

const fetchWatchlist = async () => {
  try {
    isLoading.value = true
    const response = await productService.getMyWatchlist()
    watchlist.value = response.data
  } catch (error) {
    console.error('Failed to fetch watchlist:', error)
  } finally {
    isLoading.value = false
  }
}

const listings = computed(() => 
  watchlist.value.filter(item => item.watchType === 'SALE_CARD' && item.saleCard != null)
)

onMounted(fetchWatchlist)

const goSaleCard = (id) => router.push(`/sale-cards/${id}`)

const toggleWatch = async (id) => {
  try {
    await productService.toggleSaleCardWatchlist(id)
    fetchWatchlist()
  } catch (error) {
    console.error('Failed to toggle watchlist:', error)
  }
}
</script>

<template>
  <div class="watchlist-page">
    <div class="page-head">
      <div>
        <p class="eyebrow">Collection</p>
        <h1>관심 상품</h1>
        <p>구매를 위해 찜해둔 매물 목록입니다.</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>관심 목록을 불러오는 중...</p>
    </div>

    <div v-else-if="listings.length === 0" class="empty-state">
      <div class="empty-icon">❤️</div>
      <h3>관심 상품이 없습니다.</h3>
      <p>마켓에서 마음에 드는 상품을 찜해 보세요!</p>
      <button type="button" class="primary-button" @click="router.push('/cards')">상품 보러가기</button>
    </div>

    <div v-else class="watchlist-grid">
      <article 
        v-for="item in listings" 
        :key="item.id"
        class="card-item sale-watch"
        @click="goSaleCard(item.saleCard.id)"
      >
        <div class="card-visual">
          <img v-if="item.saleCard.imageUrls && item.saleCard.imageUrls.length > 0" :src="getImageUrl(item.saleCard.imageUrls[0])" :alt="item.saleCard.title" />
          <div v-else class="placeholder-art"></div>
          <span class="type-tag sale">찜한 매물</span>

          <button 
            type="button" 
            class="like-overlay-btn active" 
            @click.stop="toggleWatch(item.saleCard.id)"
          >
            ❤️
          </button>
        </div>
        <div class="card-info">
          <span class="set-name">{{ item.saleCard.status === 'ACTIVE' ? '판매중' : '품절' }}</span>
          <strong>{{ item.saleCard.title }}</strong>
          <div class="card-meta">
            <span>{{ item.saleCard.conditionGrade }} 등급</span>
            <span class="price">{{ item.saleCard.price.toLocaleString() }}원</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.watchlist-page {
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

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.card-item {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-soft);
  border-color: var(--color-primary);
}

.card-visual {
  aspect-ratio: 0.71;
  background: var(--color-panel-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-visual img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.type-tag {
  position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase;
}
.type-tag.master { background: #e0f2fe; color: #0369a1; }
.type-tag.sale { background: #fef2f2; color: #b91c1c; }

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-name {
  font-size: 11px;
  color: var(--color-text-muted);
}

.card-info strong {
  font-size: 15px;
  color: var(--color-text-strong);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.card-meta span {
  font-size: 12px;
  color: var(--color-text-muted);
}

.price {
  color: var(--color-primary) !important;
  font-weight: 700;
}

.like-overlay-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(10, 10, 10, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
  font-size: 14px;
}

.like-overlay-btn:hover {
  background: rgba(10, 10, 10, 0.6);
  transform: scale(1.1);
}

.like-overlay-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
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
</style>
